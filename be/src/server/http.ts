import { DatabaseHandler } from '../db/index.js';
import { serviceRouter } from '../routes/service.js';
import {
  compress,
  cors,
  createServer,
  express,
  sql,
  type Application,
  type JsonObject,
  type Mode,
  type Server,
  type ServiceData
} from '../types/index.js';
import { getEnv, isProductionMode, logger } from '../utils/index.js';
import WebSocketServer from './websocket.js';

import type {} from 'swagger-ui-express';
import * as Middlewares from './middleware.js';

/**********************************************************************************/

export default class HttpServer {
  private readonly _server;
  private readonly _wss;
  private readonly _db;

  public static readonly create = async (params: {
    mode: Mode;
    dbData: { name: string; uri: string };
    routes: { api: string; health: string };
    allowedOrigins: string[] | string;
  }) => {
    const { mode, dbData, routes, allowedOrigins } = params;

    let db: DatabaseHandler | null = null;
    let server: Server | null = null;
    let wss: WebSocketServer | null = null;
    try {
      db = new DatabaseHandler({
        mode: mode,
        connName: dbData.name,
        connUri: dbData.uri
      });

      const app = express();
      server = createServer(app);

      HttpServer._attachConfigurations(server);

      app.disable('x-powered-by');

      const allowedMethods = new Set<string>([
        'HEAD',
        'GET',
        'POST',
        'PATCH',
        'DELETE',
        'OPTIONS'
      ]);
      if (isProductionMode(mode)) {
        // Make sure the reverse-proxy sets the correct settings for the logs to be
        // accurate. See: http://expressjs.com/en/guide/behind-proxies.html
        app.set('trust proxy', true);
        await HttpServer._attachMiddlewareProd({
          app: app,
          allowedMethods: allowedMethods,
          allowedOrigins: allowedOrigins
        });
      } else {
        HttpServer._attachMiddleware({
          app: app,
          allowedOrigins: allowedOrigins,
          allowedMethods: allowedMethods
        });
      }

      wss = new WebSocketServer(
        server,
        await HttpServer._setupMonitoringApplications(db)
      );
      await HttpServer._attachRoutes({
        mode: mode,
        app: app,
        db: db,
        routes: routes,
        wss: wss
      });
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err, 'Error during server initialization');
      }
      await Promise.all([db?.close(), wss?.close(), server?.close()]);
      process.exitCode = 1;

      // Even though the global event handlers are not yet set-up the docs say:
      // 'If it is necessary to terminate the Node.js process due to an error
      // condition, throwing an uncaught error and allowing the process to
      // terminate accordingly is safer than calling process.exit()'
      throw err;
    }

    // After this point, there are handlers responsible for gracefully shutting
    // down all of the resources used by the server
    HttpServer._attachEventHandlers({ server: server, wss: wss, db: db });

    return new HttpServer({ server: server, wss: wss, db: db });
  };

  private static readonly _attachConfigurations = (server: Server) => {
    server.maxHeadersCount = 256;
    server.headersTimeout = 8_000; // millis
    server.requestTimeout = 32_000; // millis
    server.timeout = 524_288; // millis
    // Limit sockets only by time, not amount of requests
    server.maxRequestsPerSocket = 0;
    server.keepAliveTimeout = 4_000; // millis
  };

  private static readonly _attachMiddlewareProd = async (params: {
    app: Application;
    allowedMethods: Set<string>;
    allowedOrigins: string[] | string;
  }) => {
    const { app, allowedMethods, allowedOrigins } = params;

    // This is the result of a bug with helmet typescript support, if helmet
    // version is updated, you may check if this is still needed
    const helmet = await import('helmet');

    app.use(
      Middlewares.checkMethod(allowedMethods),
      cors({
        origin: allowedOrigins,
        methods: Array.from(allowedMethods)
      }),
      helmet.default({
        contentSecurityPolicy: true /* require-corp */,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'same-origin' },
        originAgentCluster: true,
        referrerPolicy: { policy: 'no-referrer' },
        strictTransportSecurity: {
          maxAge: 15_552_000, // seconds
          includeSubDomains: true
        },
        xContentTypeOptions: true,
        xDnsPrefetchControl: false,
        xDownloadOptions: true,
        xFrameOptions: { action: 'sameorigin' },
        xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
        xPoweredBy: false,
        xXssProtection: true
      }),
      compress()
    );
  };

  private static readonly _attachMiddleware = (params: {
    app: Application;
    allowedMethods: Set<string>;
    allowedOrigins: string[] | string;
  }) => {
    const { app, allowedMethods, allowedOrigins } = params;

    app.use(
      cors({
        origin: allowedOrigins,
        methods: Array.from(allowedMethods)
      }),
      Middlewares.checkMethod(allowedMethods),
      compress()
    );
  };

  private static readonly _attachRoutes = async (params: {
    mode: Mode;
    app: Application;
    db: DatabaseHandler;
    routes: { api: string; health: string };
    wss: WebSocketServer;
  }) => {
    const {
      mode,
      app,
      db,
      wss,
      routes: { api: apiRoute, health: healthCheckRoute }
    } = params;

    if (!isProductionMode(mode)) {
      await HttpServer._attachSwaggerDocs(app, apiRoute);
    }

    app.get(
      healthCheckRoute,
      Middlewares.healthCheck(async () => {
        let notReadyMsg = '';
        try {
          await db.getHandler().execute(sql`SELECT NOW()`);
        } catch (err) {
          notReadyMsg += '\nDatabase is unavailable';
        }

        return notReadyMsg;
      })
    );

    // Defined after the health check route to prevent health check logs every
    // few seconds
    app.use(Middlewares.attachLogMiddleware(mode));
    app.use(
      apiRoute,
      Middlewares.attachContext(db, wss),
      serviceRouter,
      Middlewares.handleMissedRoutes,
      Middlewares.errorHandler
    );
  };

  private static readonly _attachSwaggerDocs = async (
    app: Application,
    apiRoute: string
  ) => {
    // This should never be enabled in production build. The dynamic imports allows
    // for 'swagger-ui-express' & 'yaml' to be devDependencies
    const [{ serve, setup }, { parse }, { resolve }, { readFileSync }] =
      await Promise.all([
        import('swagger-ui-express'),
        import('yaml'),
        import('node:path'),
        import('node:fs')
      ]);

    const swaggerDoc = parse(
      readFileSync(
        resolve(
          new URL('', import.meta.url).pathname,
          `../../api-docs/openapi.yml`
        ),
        'utf-8'
      )
    ) as JsonObject;

    app.use(`${apiRoute}/api-docs`, serve, setup(swaggerDoc));
  };

  private static readonly _attachEventHandlers = (params: {
    server: Server;
    db: DatabaseHandler;
    wss: WebSocketServer;
  }) => {
    const { server, db, wss } = params;

    server.on('error', (err) => {
      logger.error(err, 'HTTP Server error');
    });
    server.once('close', async () => {
      wss.close();
      await db.close();

      // Graceful shutdown
      process.exitCode = 0;
    });

    process.once('SIGINT', () => {
      server.close();
    });
    process.once('SIGTERM', () => {
      server.close();
    });
  };

  private static readonly _setupMonitoringApplications = async (
    db: DatabaseHandler
  ) => {
    const handler = db.getHandler();
    const { serviceModel } = db.getModels();

    const services = await handler
      .select({
        id: serviceModel.id,
        name: serviceModel.name,
        uri: serviceModel.uri,
        interval: serviceModel.monitorInterval
      })
      .from(serviceModel);

    return new Map<string, ServiceData>(
      services.map(({ id, name, uri, interval }) => {
        return [id, { name: name, uri: uri, interval: interval }];
      })
    );
  };

  /********************************************************************************/

  private constructor(params: {
    server: Server;
    wss: WebSocketServer;
    db: DatabaseHandler;
  }) {
    const { server, wss, db } = params;

    // When we get to this stage of the server initialization, this class handles
    // the cleanup on shutdown. Therefore remove the option to call close from
    // the returned handlers
    const { close: _, ...__wss } = wss;
    const { close: __, ...__db } = db;

    this._server = server;
    this._wss = __wss;
    this._db = __db;
  }

  public readonly listen = (port: number | string) => {
    const { mode, server: serverEnv } = getEnv();

    if (mode !== 'test') {
      this._server.listen(port, () => {
        logger.info(
          `Server is running in '${mode}' mode on:` +
            ` ${serverEnv.url}:${serverEnv.port}/${serverEnv.apiRoute}`
        );
      });
    } else {
      this._server.listen(port);
    }
  };

  public readonly getDatabase = () => {
    return this._db;
  };

  public readonly getWebSocketServer = () => {
    return this._wss;
  };

  public readonly close = () => {
    this._server.close();
  };
}

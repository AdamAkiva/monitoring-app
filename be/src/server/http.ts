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
  type Server
} from '../types/index.js';
import { isProductionMode, logger } from '../utils/index.js';

import * as Middlewares from './middleware.js';
import type MonitoredApps from './monitoredApps.js';

/**********************************************************************************/

export default class HttpServer {
  private readonly _server;
  private readonly _db;

  public static async create(params: {
    mode: Mode;
    monitoredApps: MonitoredApps;
    dbData: { name: string; uri: string };
    routes: { api: string; health: string };
    allowedOrigins: string[] | string;
  }) {
    const { mode, monitoredApps, dbData, routes, allowedOrigins } = params;

    let db: DatabaseHandler | null = null;
    let server: Server | null = null;
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

      await HttpServer._attachRoutes({
        mode: mode,
        app: app,
        db: db,
        monitoredApps: monitoredApps,
        routes: routes
      });
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err, 'Error during server initialization');
      }
      await Promise.all([db?.close()]);
      server?.close();

      process.exitCode = 1;

      // Even though the global event handlers are not yet set-up the docs say:
      // 'If it is necessary to terminate the Node.js process due to an error
      // condition, throwing an uncaught error and allowing the process to
      // terminate accordingly is safer than calling process.exit()'
      throw err;
    }

    // After this point, we can attach handlers which will be responsible for
    // gracefully shutting down all of the resources used by the server
    HttpServer._attachEventHandlers(server, db);

    return new HttpServer(server, db);
  }

  private static _attachConfigurations(server: Server) {
    server.maxHeadersCount = 256;
    server.headersTimeout = 8_000; // millis
    server.requestTimeout = 32_000; // millis
    server.timeout = 524_288; // millis
    // Limit sockets only by time, not amount of requests
    server.maxRequestsPerSocket = 0;
    server.keepAliveTimeout = 4_000; // millis
  }

  private static async _attachMiddlewareProd(params: {
    app: Application;
    allowedMethods: Set<string>;
    allowedOrigins: string[] | string;
  }) {
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
  }

  private static _attachMiddleware(params: {
    app: Application;
    allowedMethods: Set<string>;
    allowedOrigins: string[] | string;
  }) {
    const { app, allowedMethods, allowedOrigins } = params;

    app.use(
      cors({
        origin: allowedOrigins,
        methods: Array.from(allowedMethods)
      }),
      Middlewares.checkMethod(allowedMethods),
      compress()
    );
  }

  private static async _attachRoutes(params: {
    mode: Mode;
    app: Application;
    db: DatabaseHandler;
    monitoredApps: MonitoredApps;
    routes: { api: string; health: string };
  }) {
    const {
      mode,
      app,
      db,
      monitoredApps,
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

    // Make sure the monitored apps are synced to the database. This should
    // happen only once. After this point it is updated when upserting/deleting
    // entries from the map
    await monitoredApps.sync(db);

    // Defined after the health check route to prevent health check logs every
    // few seconds
    app.use(Middlewares.attachLogMiddleware(mode));
    app.use(
      apiRoute,
      Middlewares.attachContext(db, monitoredApps),
      serviceRouter,
      Middlewares.handleMissedRoutes,
      Middlewares.errorHandler
    );
  }

  private static async _attachSwaggerDocs(app: Application, apiRoute: string) {
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
  }

  private static _attachEventHandlers(server: Server, db: DatabaseHandler) {
    server.on('error', (err) => {
      logger.error(err, 'HTTP Server error');
    });
    server.once('close', () => {
      db.close().catch((e) => {
        logger.error(e, 'Error during database termination');
      });

      // Graceful shutdown
      process.exitCode = 0;
    });

    process.once('SIGINT', () => {
      server.close();
    });
    process.once('SIGTERM', () => {
      server.close();
    });
  }

  /********************************************************************************/

  private constructor(server: Server, db: DatabaseHandler) {
    this._server = server;
    this._db = db;
  }

  public listen(port: number | string, callback?: () => void) {
    port = typeof port === 'string' ? Number(port) : port;

    return this._server.listen(port, callback);
  }

  public getHandler = () => {
    return this._server;
  };

  public getDatabase() {
    return this._db;
  }

  public close() {
    this._server.close();
  }
}

import type { DatabaseHandler } from '../db/index.js';
import { serviceRouter } from '../routes/service.js';
import {
  compress,
  cors,
  createServer,
  express,
  type Logger,
  type Mode,
  type NextFunction,
  type Request,
  type Response
} from '../types/index.js';
import { isProductionMode } from '../utils/index.js';

import * as Middlewares from './middleware.js';
import type WebsocketServer from './websocket.js';

/**********************************************************************************/

export default class {
  private readonly _mode;
  private readonly _db;
  private readonly _logger;

  private readonly _app;
  private readonly _server;

  public constructor(params: {
    mode: Mode;
    db: DatabaseHandler;
    logger: Logger;
  }) {
    this._mode = params.mode;
    this._db = params.db;
    this._logger = params.logger;

    this._app = express();
    this._server = createServer(this._app);

    this._app.disable('etag').disable('x-powered-by');

    this._attachConfigurations();
    this._attachEventHandlers(this._logger);
  }

  public listen(port: number | string, callback?: () => void) {
    port = typeof port === 'string' ? Number(port) : port;

    return this._server.listen(port, callback);
  }

  public getHandler() {
    return this._server;
  }

  public close() {
    this._server.close();
  }

  public async attachMiddlewares(
    allowedMethods: Set<string>,
    allowedOrigins: Set<string>
  ) {
    const origins =
      allowedOrigins.size === 1
        ? Array.from(allowedOrigins)[0]
        : Array.from(allowedOrigins);

    if (!isProductionMode(this._mode)) {
      this._app.use(
        cors({
          methods: Array.from(allowedMethods),
          origin: origins
        }),
        Middlewares.checkMethod(allowedMethods),
        compress()
      );

      return;
    }

    const helmet = await import('helmet');

    this._app.use(
      Middlewares.checkMethod(allowedMethods),
      cors({
        methods: Array.from(allowedMethods),
        origin: origins
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

  public async attachRoutes(params: {
    allowedHosts: Set<string>;
    readCheckCallback: () => Promise<string> | string;
    logMiddleware: (req: Request, res: Response, next: NextFunction) => void;
    wss: WebsocketServer;
    routes: { api: string; health: string };
  }) {
    const {
      allowedHosts,
      readCheckCallback,
      logMiddleware,
      wss,
      routes: { api: apiRoute, health: healthCheckRoute }
    } = params;

    if (!isProductionMode(this._mode)) {
      await this._attachSwaggerDocs(apiRoute);
    }

    // Health check route
    this._app.get(
      healthCheckRoute,
      Middlewares.healthCheck(allowedHosts, readCheckCallback)
    );

    this._app.use(logMiddleware);
    this._app.use(
      apiRoute,
      Middlewares.attachContext({
        db: this._db,
        wss: wss,
        logger: this._logger
      }),
      serviceRouter,
      Middlewares.handleMissedRoutes,
      Middlewares.errorHandler
    );
  }

  /********************************************************************************/

  private _attachConfigurations() {
    this._server.maxHeadersCount = 256;
    this._server.headersTimeout = 8_000; // millis
    this._server.requestTimeout = 32_000; // millis
    this._server.timeout = 524_288; // millis
    this._server.maxRequestsPerSocket = 0;
    this._server.keepAliveTimeout = 4_000; // millis
  }

  private _attachEventHandlers(logger: Logger) {
    this._server.on('error', (err) => {
      logger.fatal(err, 'HTTP Server error');
    });
    this._server.once('close', () => {
      this._db.close().catch((err) => {
        logger.error(err, 'Error during database termination');
      });

      // Graceful shutdown
      process.exitCode = 0;
    });

    process.once('SIGINT', () => {
      this._server.close();
    });
    process.once('SIGTERM', () => {
      this._server.close();
    });
  }

  private async _attachSwaggerDocs(apiRoute: string) {
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
    );

    this._app.use(`${apiRoute}/api-docs`, serve, setup(swaggerDoc));
  }
}

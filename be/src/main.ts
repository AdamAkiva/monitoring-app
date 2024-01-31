import { DatabaseHandler } from './db/index.js';
import { HttpServer, WebsocketServer } from './server/index.js';
import { EventEmitter, sql } from './types/index.js';
import { getEnv, logMiddleware, logger } from './utils/index.js';

/**********************************************************************************/

const startServer = async () => {
  EventEmitter.captureRejections = true;

  const { mode, server: serverEnv, db: dbUri } = getEnv();
  const allowedMethods = new Set<string>([
    'HEAD',
    'GET',
    'POST',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ]);

  const db = new DatabaseHandler({
    mode: mode,
    connName: `monitoring-app-pg-${mode}`,
    connUri: dbUri
  });
  const monitorMap = await db.getMonitoredApplications();

  const server = new HttpServer({ mode: mode, db: db, logger: logger });
  const wss = new WebsocketServer(server.getHandler(), monitorMap);
  await server.attachMiddlewares(allowedMethods, serverEnv.allowedOrigins);
  await server.attachRoutes({
    allowedHosts: serverEnv.healthCheck.allowedHosts,
    async readCheckCallback() {
      let notReadyMsg = '';
      try {
        await db.getHandler().execute(sql`SELECT NOW()`);
      } catch (err) {
        notReadyMsg += '\nDatabase is unavailable';
      }

      return notReadyMsg;
    },
    logMiddleware: logMiddleware,
    wss: wss,
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${serverEnv.healthCheck.route}`
    }
  });

  process.once('unhandledRejection', globalErrorHandler(server, 'rejection'));
  process.once('uncaughtException', globalErrorHandler(server, 'exception'));

  process.on('warning', (err) => {
    logger.warn(err);
  });

  server.listen(serverEnv.port, () => {
    logger.info(
      `Server is running in '${mode}' mode on:` +
        ` ${serverEnv.url}:${serverEnv.port}/${serverEnv.apiRoute}`
    );
  });
};

const globalErrorHandler = (
  server: HttpServer,
  reason: 'exception' | 'rejection'
) => {
  return (err: unknown) => {
    logger.fatal(err, `Unhandled ${reason}`);

    server.close();

    // See: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
    process.exitCode = 1;
  };
};

/**********************************************************************************/

await startServer();

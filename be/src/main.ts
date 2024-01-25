import { HttpServer, MonitoredApps, WebSocketServer } from './server/index.js';
import { EventEmitter } from './types/index.js';
import { getEnv, logger } from './utils/index.js';

/**********************************************************************************/

const startServer = async () => {
  EventEmitter.captureRejections = true;

  const { mode, server: serverEnv, db: dbUri } = getEnv();

  const monitoredApps = new MonitoredApps();
  const server = await HttpServer.create({
    mode: mode,
    dbData: { name: `monitoring-app-postgres-${mode}`, uri: dbUri },
    monitoredApps: monitoredApps,
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${serverEnv.healthCheckRoute}`
    },
    allowedOrigins: serverEnv.allowedOrigins
  });

  process.once('unhandledRejection', globalErrorHandler(server, 'rejection'));
  process.once('uncaughtException', globalErrorHandler(server, 'exception'));

  process.on('warning', (err) => {
    logger.warn(err);
  });

  void new WebSocketServer(server.getHandler(), monitoredApps);
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

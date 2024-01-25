import { HttpServer, MonitoredApps } from '../../src/server/index.js';
import { logger } from '../../src/utils/index.js';

/**********************************************************************************/

type Provide = { provide: (key: string, value: unknown) => void };

/**********************************************************************************/

export const setup = async ({ provide }: Provide) => {
  const { mode, server: serverEnv, db: dbUri } = getTestEnv();
  const healthCheckRoute = serverEnv.healthCheck.route;

  provide('urls', {
    baseURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.apiRoute}`,
    healthCheckURL: `${serverEnv.base}:${serverEnv.port}/${healthCheckRoute}`
  });

  const monitoredApps = new MonitoredApps();
  const server = await HttpServer.create({
    mode: mode,
    dbData: { name: 'monitoring-app-pg-test', uri: dbUri },
    monitoredApps: monitoredApps,
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${healthCheckRoute}`
    },
    allowedHosts: new Set(),
    allowedOrigins: new Set()
  });

  server.listen(serverEnv.port);

  return async () => {
    const db = server.getDatabase();
    const handler = db.getHandler();
    const models = db.getModels();

    /* eslint-disable drizzle/enforce-delete-with-where */
    await handler.delete(models.serviceModel);
    await handler.delete(models.thresholdModel);
    /* eslint-enable drizzle/enforce-delete-with-where */

    server.close();
  };
};

/**********************************************************************************/

export const getTestEnv = () => {
  const mode = process.env.NODE_ENV;
  checkRuntimeEnv(mode);
  checkEnvVariables();

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  return {
    mode: process.env.NODE_ENV as 'test',
    server: {
      base: 'http://localhost',
      port: process.env.TEST_SERVER_PORT!,
      apiRoute: process.env.API_ROUTE!,
      healthCheck: {
        route: process.env.HEALTH_CHECK_ROUTE!,
        allowedHosts: new Set(process.env.ALLOWED_HOSTS!.split(','))
      },
      allowedOrigins: new Set(process.env.ALLOWED_ORIGINS!.split(','))
    },
    db: process.env.TEST_DB_URI!
  };
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
};

const checkRuntimeEnv = (mode?: string | undefined): mode is 'test' => {
  if (mode && mode === 'test') {
    return true;
  }

  logger.fatal(
    `Missing or invalid 'NODE_ENV' env value, should never happen.` +
      ' Unresolvable, exiting...'
  );

  process.kill(process.pid, 'SIGTERM');
  throw new Error('Graceful shutdown');
};

const checkEnvVariables = () => {
  let missingValues = '';
  checkMissingEnvVariables().forEach((val, key) => {
    if (!process.env[key]) {
      missingValues += `* ${val}\n`;
    }
  });

  if (missingValues) {
    logger.fatal(`\nMissing the following env vars: ${missingValues}`);

    process.kill(process.pid, 'SIGTERM');
    throw new Error('Graceful shutdown');
  }
};

const checkMissingEnvVariables = () => {
  return new Map<string, string>([
    ['TEST_SERVER_PORT', `Missing 'TEST_SERVER_PORT', env variable`],
    ['API_ROUTE', `Missing 'API_ROUTE', env variable`],
    ['HEALTH_CHECK_ROUTE', `Missing 'HEALTH_CHECK_ROUTE', env variable`],
    ['ALLOWED_HOSTS', `Missing 'ALLOWED_HOSTS', env variable`],
    ['ALLOWED_ORIGINS', `Missing 'ALLOWED_ORIGINS', env variable`],
    ['TEST_DB_URI', `Missing 'TEST_DB_URI', env variable`]
  ]);
};

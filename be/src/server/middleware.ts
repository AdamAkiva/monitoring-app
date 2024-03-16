import type { DatabaseHandler } from '../db/index.js';
import type {
  Logger,
  NextFunction,
  Request,
  Response
} from '../types/index.js';
import { MonitoringAppError, STATUS, strcasecmp } from '../utils/index.js';
import type WebsocketServer from './websocket.js';

/**********************************************************************************/

export const checkMethod = (allowedMethods: Set<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const reqMethod = req.method.toUpperCase();

    if (!allowedMethods.has(reqMethod)) {
      return res.status(STATUS.NOT_ALLOWED.CODE).json(STATUS.NOT_ALLOWED.MSG);
    }

    return next();
  };
};

export const healthCheck = (
  allowedHosts: Set<string>,
  isReadyCallback: () => Promise<string> | string
) => {
  return async (req: Request, res: Response) => {
    if (strcasecmp(req.method, 'GET')) {
      return res
        .status(STATUS.BAD_REQUEST.CODE)
        .json(`Health check must be a 'GET' request`);
    }

    const hostName = req.hostname.toLowerCase();
    if (!allowedHosts.has(hostName)) {
      return res.status(STATUS.FORBIDDEN.CODE).json(STATUS.FORBIDDEN.MSG);
    }

    let notReadyMsg = await isReadyCallback();
    if (notReadyMsg) {
      notReadyMsg = `Application is not available: ${notReadyMsg}`;
    }
    if (notReadyMsg) {
      return res.status(STATUS.GATEWAY_TIMEOUT.CODE).json(notReadyMsg);
    }

    return res.status(STATUS.NO_CONTENT.CODE).end();
  };
};

export const attachContext = (params: {
  db: DatabaseHandler;
  wss: WebsocketServer;
  logger: Logger;
}) => {
  const { db, wss, logger } = params;

  return (req: Request, _: Response, next: NextFunction) => {
    req.monitoringApp = {
      db: db,
      wss: wss,
      logger: logger
    };

    return next();
  };
};

export const handleMissedRoutes = (_: Request, res: Response) => {
  return res.status(STATUS.NOT_FOUND.CODE).json(STATUS.NOT_FOUND.MSG);
};

export const errorHandler = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/max-params
) => {
  if (res.headersSent) {
    return next(err);
  }
  res.err = err; // Needed in order to display the correct stack trace in the logs

  if (!strcasecmp(err.name, 'PayloadTooLargeError')) {
    return res
      .status(STATUS.PAYLOAD_TOO_LARGE.CODE)
      .json(STATUS.PAYLOAD_TOO_LARGE.MSG);
  }

  if (err instanceof MonitoringAppError) {
    return res.status(err.getCode()).json(err.getMessage());
  }

  return res
    .status(STATUS.SERVER_ERROR.CODE)
    .json('Unexpected error, please try again');
};

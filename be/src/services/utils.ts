import { pg } from '../types/index.js';
import { ERR_CODES, MonitoringAppError, STATUS } from '../utils/index.js';

/**********************************************************************************/

export const sanitizeError = (
  err: unknown,
  entity?: { type: 'Service'; name: string }
) => {
  if (err instanceof pg.PostgresError) {
    switch (err.code) {
      case ERR_CODES.PG.UNIQUE_VIOLATION:
        if (entity) {
          return new MonitoringAppError(
            `${entity.type} '${entity.name}' already exists'`,
            STATUS.CONFLICT.CODE
          );
        }

        return new MonitoringAppError(err.message, STATUS.SERVER_ERROR.CODE);
      default:
        return new MonitoringAppError(err.message, STATUS.GATEWAY_TIMEOUT.CODE);
    }
  }

  if (err instanceof Error) {
    return err;
  }

  return new MonitoringAppError(
    'Thrown a non-error object. Should not be possible',
    STATUS.SERVER_ERROR.CODE
  );
};

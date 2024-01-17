import { ERR_CODES } from '../db/handler.js';
import { postgres as pg, type Request } from '../types/index.js';
import { STATUS } from './constants.js';
import MonitoringAppError from './error.js';

/**********************************************************************************/

/**
 * Generics allows for VSCode type completion
 * The compare disregard case (more formally known as case-insensitive compare)
 * @returns 0 if s1 and s2 are lexicographic equal.
 * A negative value if s1 is lexicographic less than s2.
 * A positive value if s1 is lexicographic greater than s2.
 */
export const strcasecmp = <T extends string>(s1: T, s2: T) => {
  return s1.localeCompare(s2, undefined, {
    sensitivity: 'accent'
  });
};

export const findClientIp = (req: Request) => {
  return req.ip ?? 'Unknown';
};

export const filterNullAndUndefined = <T>(
  value?: T | null | undefined
): value is T => {
  return value != null;
};

export const sanitizeError = (
  err: unknown,
  entity?: { type: 'Website'; name: string }
) => {
  if (err instanceof pg.PostgresError) {
    switch (err.code) {
      case ERR_CODES.UNIQUE_VIOLATION:
        return new MonitoringAppError(
          `${entity!.type} '${entity!.name}' already exists'`,
          STATUS.CONFLICT.CODE
        );
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

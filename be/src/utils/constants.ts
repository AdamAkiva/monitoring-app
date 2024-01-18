export const STATUS = {
  SUCCESS: {
    CODE: 200,
    MSG: 'Success'
  },
  CREATED: {
    CODE: 201,
    MSG: 'Created'
  },
  NO_CONTENT: {
    CODE: 204
  },
  BAD_REQUEST: {
    CODE: 400,
    MSG: 'Bad request'
  },
  FORBIDDEN: {
    CODE: 403,
    MSG: 'Forbidden'
  },
  NOT_FOUND: {
    CODE: 404,
    MSG: 'Not found'
  },
  NOT_ALLOWED: {
    CODE: 405,
    MSG: 'Method not allowed'
  },
  CONFLICT: {
    CODE: 409,
    MSG: 'Conflict'
  },
  PAYLOAD_TOO_LARGE: {
    CODE: 413,
    MSG: 'Request payload is too large'
  },
  SERVER_ERROR: {
    CODE: 500,
    MSG: 'Server error, please try again'
  },
  GATEWAY_TIMEOUT: {
    CODE: 504,
    MSG: 'Server error, please try again'
  }
} as const;

export const VALIDATION = {
  NAME_MIN_LEN: 1,
  NAME_MAX_LEN: 2048,
  URI_MIN_LEN: 1,
  URI_MAX_LEN: 2048,
  MONITOR_INTERVAL_MIN_VALUE: 1,
  MONITOR_INTERVAL_MAX_VALUE: Number.MAX_SAFE_INTEGER,
  THRESHOLD_MIN_VALUE: 0,
  THRESHOLD_MAX_VAL: Number.MAX_SAFE_INTEGER
} as const;

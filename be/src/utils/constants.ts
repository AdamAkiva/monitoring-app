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
  URL_MAX_LEN: 2048,
  COLOR_NAME_MAX_LEN: 64,
  THRESHOLD_MAX_VAL: 65_536
} as const;

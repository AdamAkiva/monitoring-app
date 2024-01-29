const NAME_AND_URI_MIN_LENGTH = 1;
const NAME_AND_URI_MAX_LENGTH = 2048;
const MONITOR_INTERVAL_MIN_VALUE = 200;
const MONITOR_INTERVAL_MAX_VALUE = Number.MAX_SAFE_INTEGER;
const THRESHOLD_MAX_VALUE = Number.MAX_SAFE_INTEGER;

/**********************************************************************************/

export const nameValidator = (name: string) => {
  if (name.length < NAME_AND_URI_MIN_LENGTH) {
    return 'Name must not be empty';
  }
  if (name.length > NAME_AND_URI_MAX_LENGTH) {
    return `Name must contain at most ${NAME_AND_URI_MAX_LENGTH} characters`;
  }

  return '';
};

export const uriValidator = (uri: string) => {
  if (uri.length < NAME_AND_URI_MIN_LENGTH) {
    return 'Uri must not be empty';
  }
  if (uri.length > NAME_AND_URI_MAX_LENGTH) {
    return `Uri must contain at most ${NAME_AND_URI_MAX_LENGTH} characters`;
  }

  return '';
};

export const monitorIntervalValidator = (monitorInterval: string) => {
  const interval = Number(monitorInterval);
  if (Number.isNaN(interval)) {
    return 'Monitor interval must be a valid number';
  }
  if (interval < MONITOR_INTERVAL_MIN_VALUE) {
    return `Monitor interval must be more than ${MONITOR_INTERVAL_MIN_VALUE}`;
  }
  if (interval > MONITOR_INTERVAL_MAX_VALUE) {
    return `Monitor interval must be less than ${MONITOR_INTERVAL_MAX_VALUE}`;
  }

  return '';
};

export const thresholdValidator = (lowerLimit: string, upperLimit: string) => {
  const lowerThreshold = Number(lowerLimit);
  const upperThreshold = Number(upperLimit);

  const errMsgs = {
    lowerThreshold: '',
    upperThreshold: ''
  };
  if (Number.isNaN(lowerThreshold)) {
    errMsgs.lowerThreshold = 'Lower limit must be a valid number';
  }
  if (Number.isNaN(upperThreshold)) {
    errMsgs.upperThreshold = 'Upper limit must be a valid number';
  }
  if (errMsgs.lowerThreshold || errMsgs.upperThreshold) {
    // If one or more of the checked values is NaN, there's no reason to continue
    // the following check(s)
    return errMsgs;
  }

  if (lowerThreshold < 0) {
    errMsgs.lowerThreshold = 'Lower limit must be a positive number';
  }
  if (upperThreshold < 0) {
    errMsgs.upperThreshold = 'Upper limit must be a positive number';
  }
  if (lowerThreshold > THRESHOLD_MAX_VALUE) {
    errMsgs.lowerThreshold = `Lower limit must be less than ${THRESHOLD_MAX_VALUE}`;
  }
  if (upperThreshold > THRESHOLD_MAX_VALUE) {
    errMsgs.upperThreshold = `Upper limit must be less than ${THRESHOLD_MAX_VALUE}`;
  }

  return errMsgs;
};

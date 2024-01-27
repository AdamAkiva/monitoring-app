import type { Service } from '@/types';

/**********************************************************************************/

const DEFAULT_SERVICE_DATA = {
  name: '',
  uri: '',
  monitorInterval: -1,
  thresholds: [{ id: '', lowerLimit: -1, upperLimit: -1 }]
};
export const DEFAULT_SERVICE_DATA_WITH_ID: Service = {
  ...DEFAULT_SERVICE_DATA,
  id: ''
};
export const DEFAULT_SERVICE_DATA_WITHOUT_ID: Omit<Service, 'id'> =
  DEFAULT_SERVICE_DATA;

export const SUPPORTED_COLORS = ['#33cc33', '#ff9900', '#ff3300'];

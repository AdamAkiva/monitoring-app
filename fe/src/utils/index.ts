import {
  HttpInstance,
  WebsocketInstance,
  createService,
  deleteService,
  fetchServices,
  httpInstance,
  updateService
} from './api';
import { getEnvValue, getRuntimeMode } from './env.ts';
import { uppercaseFirstLetter } from './functions.ts';

/**********************************************************************************/

export {
  HttpInstance,
  WebsocketInstance,
  createService,
  deleteService,
  fetchServices,
  getEnvValue,
  getRuntimeMode,
  httpInstance,
  updateService,
  uppercaseFirstLetter
};

import { randomUUID } from 'node:crypto';

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  inject,
  it
} from 'vitest';

import * as controllers from '../../src/controllers/index.js';
import type {
  CreateThreshold,
  CreateService as DCreateService
} from '../../src/db/index.js';
import * as Middlewares from '../../src/server/middleware.js';
import * as services from '../../src/services/index.js';
import {
  ky,
  type KyOptions,
  type Optional,
  type RequiredFields,
  type Service,
  type UnknownObject
} from '../../src/types/index.js';
import { STATUS, VALIDATION } from '../../src/utils/index.js';

/**********************************************************************************/

export type CreateService = Optional<DCreateService, 'name'> & {
  thresholds: Omit<CreateThreshold, 'serviceId'>[];
};
export type UpdateService = Partial<DCreateService> & {
  thresholds?: Omit<CreateThreshold, 'serviceId'>[];
};

/**********************************************************************************/

export const omit = <T extends UnknownObject, K extends string & keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  const cpy = { ...obj };
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete cpy[key];
  }

  return cpy as Omit<T, K>;
};

export const sendHttpRequest = async <ReturnType = unknown>(
  url: string,
  options: RequiredFields<KyOptions, 'method'> = { method: 'get' }
) => {
  const res = await ky(url, {
    ...options,
    retry: { limit: 0 }, // Force no retries
    timeout: 4_000, // millis
    throwHttpErrors: false
  });

  const contentType = res.headers.get('content-type');
  if (!contentType) {
    return {
      data: '' as ReturnType,
      statusCode: res.status
    };
  }

  if (contentType.includes('application/json')) {
    return {
      data: (await res.json()) as ReturnType,
      statusCode: res.status
    };
  }
  if (contentType.includes('text/html')) {
    return {
      data: (await res.text()) as ReturnType,
      statusCode: res.status
    };
  }

  throw new Error('Unsupported content type');
};

export const checkMatchIgnoringOrder = (
  partialValues: unknown[],
  results: unknown[]
) => {
  for (const partialValue of partialValues) {
    expect(results).toEqual(
      expect.arrayContaining([
        recursivelyCheckFields(partialValue as UnknownObject)
      ])
    );
  }
};

const recursivelyCheckFields = (obj: UnknownObject): unknown => {
  if (typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return expect.arrayContaining(obj.map(recursivelyCheckFields));
  }

  const result: UnknownObject = {};
  for (const key in obj) {
    result[key] = recursivelyCheckFields(obj[key] as UnknownObject);
  }

  return expect.objectContaining(result);
};

export const createServices = async (servicesData: CreateService[]) => {
  const serviceRouteURL = `${inject('urls').baseURL}/services`;

  // Didn't use Promise.all() because I wanted the order be kept the same as the
  // client requested
  const services: Service[] = [];
  for (const serviceData of servicesData) {
    const { data, statusCode } = await sendHttpRequest<Service>(
      serviceRouteURL,
      {
        method: 'post',
        json: serviceData
      }
    );
    expect(statusCode).toBe(STATUS.CREATED.CODE);

    services.push(data);
  }

  return services;
};

/**********************************************************************************/

export {
  Middlewares,
  STATUS,
  VALIDATION,
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  controllers,
  describe,
  expect,
  inject,
  it,
  randomUUID,
  services,
  type Service
};

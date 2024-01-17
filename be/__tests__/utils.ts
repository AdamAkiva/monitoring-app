import { randomUUID } from 'node:crypto';

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import * as controllers from '../src/controllers/index.js';
import * as Middlewares from '../src/server/middleware.js';
import * as services from '../src/services/index.js';
import type { UnknownObject, Website } from '../src/types/index.js';
import { STATUS, VALIDATION } from '../src/utils/index.js';

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
  it,
  randomUUID,
  services,
  type Website
};

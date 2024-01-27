import { EventEmitter } from 'node:events';
import { createServer, type Server } from 'node:http';
import { hostname, machine, platform, release } from 'node:os';
import { pid, version } from 'node:process';
import { setTimeout as setTimeoutAsync } from 'node:timers/promises';
import { URL } from 'node:url';

import compress from 'compression';
import cors from 'cors';
import { eq, sql, SQL } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import express, {
  json,
  Router,
  type Application,
  type Request as ExpressRequest,
  type NextFunction,
  type Response
} from 'express';
import type core from 'express-serve-static-core';
import ky, { type Options as KyOptions } from 'ky';
import { pinoHttp, type HttpLogger } from 'pino-http';
import pg from 'postgres';
import type qs from 'qs';
import type { JsonObject } from 'swagger-ui-express';
import { WebSocket, WebSocketServer } from 'ws';
import { z as Zod } from 'zod';

import type { Service } from './api.js';

/**********************************************************************************/

export type Request = ExpressRequest<
  core.ParamsDictionary,
  UnknownObject,
  UnknownObject,
  qs.ParsedQs,
  UnknownObject
>;

export type Mode = 'development' | 'production' | 'test';

export type UnknownObject = { [key: string]: unknown };
export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;

export type EnvironmentVariables = {
  mode: Mode;
  server: {
    port: string;
    url: string;
    apiRoute: string;
    healthCheck: { route: string; allowedHosts: Set<string> };
    allowedOrigins: Set<string>;
  };
  db: string;
};

/**********************************************************************************/

export type ServiceData = { name: string; uri: string; interval: number };

/**********************************************************************************/

export {
  compress,
  cors,
  createServer,
  drizzle,
  eq,
  EventEmitter,
  express,
  hostname,
  json,
  ky,
  machine,
  pg,
  pid,
  pinoHttp,
  platform,
  release,
  Router,
  setTimeoutAsync,
  SQL,
  sql,
  URL,
  version,
  WebSocket,
  WebSocketServer,
  Zod,
  type Application,
  type HttpLogger,
  type JsonObject,
  type KyOptions,
  type NextFunction,
  type Response,
  type Server,
  type Service
};

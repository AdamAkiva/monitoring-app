import { EventEmitter } from 'node:events';
import { createServer, type Server } from 'node:http';
import { hostname, machine, platform, release } from 'node:os';
import { pid, version } from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { URL } from 'node:url';

import compress from 'compression';
import cors from 'cors';
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  ne,
  notInArray,
  sql,
  SQL
} from 'drizzle-orm';
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
    healthCheckRoute: string;
    allowedOrigins: string[] | string;
  };
  db: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResolvedValue<T> = T extends (...args: any) => any
  ? PromiseFulfilledResult<Awaited<ReturnType<T>>>
  : PromiseFulfilledResult<Awaited<T>>;

/**********************************************************************************/

export type ServiceData = { name: string; uri: string; interval: number };

export type Service = {
  id: string;
  name: string;
  uri: string;
  monitorInterval: number;
  thresholds: {
    lowerLimit: number;
    upperLimit: number;
  }[];
};

/**********************************************************************************/

export {
  and,
  asc,
  compress,
  cors,
  createServer,
  desc,
  drizzle,
  eq,
  EventEmitter,
  express,
  hostname,
  inArray,
  isNotNull,
  isNull,
  json,
  ky,
  machine,
  ne,
  notInArray,
  pg,
  pid,
  pinoHttp,
  platform,
  release,
  Router,
  setTimeout,
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
  type Server
};

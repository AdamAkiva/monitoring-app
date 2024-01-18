import { createServer, type Server } from 'node:http';
import { hostname, machine, platform, release } from 'node:os';
import { pid, version } from 'node:process';
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
  type NextFunction,
  type Request,
  type Response
} from 'express';
import ky from 'ky';
import { pinoHttp, type HttpLogger } from 'pino-http';
import postgres from 'postgres';
import { WebSocket, WebSocketServer } from 'ws';
import { z as Zod } from 'zod';

/**********************************************************************************/

export type Mode = 'development' | 'production' | 'test';

export type UnknownObject = { [key: string]: unknown };
export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T;

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

export type Website = {
  id: string;
  url: string;
  monitorInterval: number;
  thresholds: {
    color: string;
    limit: number;
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
  pid,
  pinoHttp,
  platform,
  postgres,
  release,
  Router,
  SQL,
  sql,
  URL,
  version,
  WebSocket,
  WebSocketServer,
  Zod,
  type Application,
  type HttpLogger,
  type NextFunction,
  type Request,
  type Response,
  type Server
};

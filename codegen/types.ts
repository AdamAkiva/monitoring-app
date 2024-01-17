/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface WebsiteCreationObj {
  /**
   * @format url
   * @example "https://google.com"
   */
  url: string;
  /** The interval of every latency check */
  monitorInterval: number;
  /** @minItems 1 */
  thresholds: {
    color: 'green' | 'orange' | 'red';
    limit: number;
  }[];
}

export interface WebsiteUpdatesObj {
  /**
   * @format url
   * @example "https://google.com"
   */
  url?: string;
  /** The interval of every latency check */
  monitorInterval?: number;
  /** @minItems 1 */
  thresholds?: {
    color: 'green' | 'orange' | 'red';
    limit: number;
  }[];
}

export interface Website {
  /**
   * @format url
   * @example "https://google.com"
   */
  url: string;
  /** The interval of every latency check */
  monitorInterval: number;
  /** @minItems 1 */
  thresholds: {
    color: 'green' | 'orange' | 'red';
    limit: number;
  }[];
}

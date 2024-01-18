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

export interface ServiceCreationObj {
  /**
   * The name for the monitored service. Defaults to uri if not supplied
   * @example "Google"
   */
  name?: string;
  /**
   * @format uri
   * @example "https://google.com"
   */
  uri: string;
  /** The interval of every latency check */
  monitorInterval: number;
  /** @minItems 1 */
  thresholds: {
    /**
     * Milliseconds representing the lower limit for the threshold check
     * @example 20
     */
    lowerLimit: number;
    /**
     * Milliseconds representing the upper limit for the threshold check
     * @example 50
     */
    upperLimit: number;
  }[];
}

export interface ServiceUpdatesObj {
  /** @example "Google" */
  name?: string;
  /**
   * @format uri
   * @example "https://google.com"
   */
  uri?: string;
  /** The interval of every latency check */
  monitorInterval?: number;
  /** @minItems 1 */
  thresholds?: {
    /**
     * Milliseconds representing the lower limit for the threshold check
     * @example 20
     */
    lowerLimit: number;
    /**
     * Milliseconds representing the upper limit for the threshold check
     * @example 50
     */
    upperLimit: number;
  }[];
}

export interface Service {
  /**
   * @format uuid
   * @example "adb3271f-94dc-4169-80e9-3d4c8a90201f"
   */
  id: string;
  /** @example "Google" */
  name: string;
  /**
   * @format uri
   * @example "https://google.com"
   */
  uri: string;
  /** The interval of every latency check */
  monitorInterval: number;
  /** @minItems 1 */
  thresholds: {
    /**
     * Milliseconds representing the lower limit for the threshold check
     * @example 20
     */
    lowerLimit: number;
    /**
     * Milliseconds representing the upper limit for the threshold check
     * @example 50
     */
    upperLimit: number;
  }[];
}

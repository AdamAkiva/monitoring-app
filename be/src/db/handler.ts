// The default import is on purpose. See: https://orm.drizzle.team/docs/sql-schema-declaration
import { drizzle, pg, type Mode } from '../types/index.js';
import { isProductionMode } from '../utils/functions.js';

import * as schema from './schemas.js';

/**********************************************************************************/

export type DBHandler = DatabaseHandler['_handler'];
export type DBModels = DatabaseHandler['_models'];
export type Transaction = Parameters<
  Parameters<DBHandler['transaction']>[0]
>[0];

/**********************************************************************************/

export default class DatabaseHandler {
  private readonly _conn;
  private readonly _handler;
  private readonly _models;

  public constructor(params: {
    mode: Mode;
    connName: string;
    connUri: string;
  }) {
    const { mode, connName, connUri } = params;

    this._conn = pg(connUri, {
      connect_timeout: 30, // in secs
      idle_timeout: 180, // in secs
      max: 20,
      max_lifetime: 3_600, // in secs
      connection: {
        application_name: connName
      },
      debug: !isProductionMode(mode)
    });

    this._handler = drizzle(this._conn, {
      schema: schema
      // logger: !isProductionMode(mode)
    });

    this._models = {
      serviceModel: schema.serviceModel,
      thresholdModel: schema.thresholdModel
    };
  }

  /********************************************************************************/

  public getConnection() {
    return this._conn;
  }

  public getHandler() {
    return this._handler;
  }

  public getModels() {
    return this._models;
  }

  public async close() {
    return await this._conn.end({ timeout: 4_000 });
  }
}

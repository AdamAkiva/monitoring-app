// The default import is on purpose. See: https://orm.drizzle.team/docs/sql-schema-declaration
import { drizzle, pg, type Mode, type ServiceData } from '../types/index.js';
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

    this._handler = drizzle(this._conn, { schema: schema });

    this._models = {
      serviceModel: schema.serviceModel,
      thresholdModel: schema.thresholdModel
    };
  }

  /********************************************************************************/

  public async getMonitoredApplications() {
    const services = await this._handler
      .select({
        id: this._models.serviceModel.id,
        name: this._models.serviceModel.name,
        uri: this._models.serviceModel.uri,
        interval: this._models.serviceModel.monitorInterval
      })
      .from(this._models.serviceModel);

    return new Map<string, ServiceData>(
      services.map(({ id, name, uri, interval }) => {
        return [id, { name: name, uri: uri, interval: interval }];
      })
    );
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

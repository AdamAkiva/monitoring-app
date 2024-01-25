import type { DatabaseHandler } from '../db/index.js';
import type { ServiceData } from '../types/index.js';

/**********************************************************************************/

export default class {
  private readonly _monitoredApps;

  public constructor() {
    this._monitoredApps = new Map<string, ServiceData>();
  }

  public async sync(db: DatabaseHandler) {
    const handler = db.getHandler();
    const { serviceModel } = db.getModels();

    const services = await handler
      .select({
        id: serviceModel.id,
        name: serviceModel.name,
        uri: serviceModel.uri,
        interval: serviceModel.monitorInterval
      })
      .from(serviceModel);

    services.forEach(({ id, name, uri, interval }) => {
      this._monitoredApps.set(id, { name: name, uri: uri, interval: interval });
    });

    return this;
  }

  public entries() {
    return this._monitoredApps[Symbol.iterator]();
  }

  public get(serviceId: string) {
    return this._monitoredApps.get(serviceId);
  }

  public upsert(serviceId: string, service: ServiceData) {
    this._monitoredApps.set(serviceId, {
      name: service.name,
      uri: service.uri,
      interval: service.interval
    });

    return this;
  }

  public delete(serviceId: string) {
    this._monitoredApps.delete(serviceId);

    return this;
  }
}

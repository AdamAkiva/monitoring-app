import {
  WebSocket,
  WebSocketServer,
  ky,
  setTimeoutAsync,
  type Server,
  type ServiceData
} from '../types/index.js';
import { ERR_CODES, STATUS, logger } from '../utils/index.js';

import type MonitoredApps from './monitoredApps.js';

/**********************************************************************************/

export default class {
  private readonly _wss;
  private readonly _monitorMap;
  private readonly _sendHttpRequest;

  public constructor(server: Server, monitorMap: MonitoredApps) {
    // The server is bound to the http server instance, hence there's no need
    // for a close function, the server initiates closure when the http server does
    this._wss = new WebSocketServer({
      server: server,
      backlog: 512,
      maxPayload: 65_536,
      clientTracking: true
    });
    this._monitorMap = monitorMap;

    this._sendHttpRequest = ky.create({
      retry: 2,
      timeout: 4_000,
      throwHttpErrors: true
    });

    this._scheduleMonitors();
    this._attachEventHandlers();
  }

  private _scheduleMonitors() {
    for (const [serviceId, service] of this._monitorMap.entries()) {
      this._monitorCheckCallback(serviceId, service.uri);
    }
  }

  private async _monitorCheck(serviceId: string, serviceUri: string) {
    const broadcastMsg = await this._sendPingRequest(serviceUri);
    this._sendBroadcastMessage(broadcastMsg);
    await this._rescheduleCheck(serviceId);
  }

  private async _sendPingRequest(serviceUri: string) {
    let startTime = performance.now();
    let status = (await this._sendHttpRequest(serviceUri)).status;
    let reqTime = performance.now() - startTime;

    if (status === STATUS.NOT_ALLOWED.CODE) {
      startTime = performance.now();
      status = (await this._sendHttpRequest(serviceUri)).status;
      reqTime = performance.now() - startTime;
    }
    if (status >= 200 && status < 300) {
      return { serviceUri: serviceUri, reqTime: Number(reqTime.toFixed(2)) };
    }

    return { serviceUri: serviceUri, reqTime: -1 };
  }

  private _sendBroadcastMessage(msg: { serviceUri: string; reqTime: number }) {
    this._wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  }

  private async _rescheduleCheck(serviceId: string) {
    const service = this._monitorMap.get(serviceId);
    if (!service) {
      return await Promise.resolve();
    }
    await setTimeoutAsync(service.interval);
    this._monitorCheckCallback(serviceId, service.uri);
  }

  private _attachEventHandlers() {
    this._wss.on('error', (err) => {
      logger.error(err, 'Socket Server error');
    });
    this._wss.on('close', () => {
      this._wss.clients.forEach((client) => {
        client.close(ERR_CODES.WS.SERVER_CLOSED, 'Server shutdown');
      });
    });

    this._wss.on('connection', (socket) => {
      socket.on('error', (err) => {
        logger.error(err, 'Socket client error');
      });
    });
  }

  private readonly _monitorCheckCallback = (
    serviceId: string,
    serviceUri: string
  ) => {
    // Not awaiting on purpose, I don't want to await for the completion since
    // I don't mind minor timing errors. With that said I don't want a
    // rejection to not be caught and handles, hence this is the result
    this._monitorCheck(serviceId, serviceUri).catch((e) => {
      logger.error(e, 'Monitor check failed');
    });
  };

  /********************************************************************************/

  public upsertMonitoredService(serviceId: string, service: ServiceData) {
    this._monitorMap.upsert(serviceId, {
      name: service.name,
      uri: service.uri,
      interval: service.interval
    });

    this._monitorCheckCallback(serviceId, service.uri);
  }

  public deleteMonitoredService(serviceId: string) {
    this._monitorMap.delete(serviceId);
  }
}

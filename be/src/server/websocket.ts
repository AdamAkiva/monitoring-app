import {
  WebSocket,
  WebSocketServer,
  ky,
  setTimeoutAsync,
  type Server,
  type ServiceData
} from '../types/index.js';
import { ERR_CODES, STATUS, logger } from '../utils/index.js';

/**********************************************************************************/

type Service = { id: string; uri: string };

/**********************************************************************************/

export default class {
  private readonly _wss;
  private readonly _monitorMap;
  private readonly _sendHttpRequest;

  public constructor(server: Server, monitorMap: Map<string, ServiceData>) {
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
      this._monitorCheckCallback({ id: serviceId, uri: service.uri });
    }
  }

  private async _monitorCheck(service: Service) {
    const broadcastMsg = await this._sendPingRequest(service);
    this._sendBroadcastMessage(broadcastMsg);
    await this._rescheduleCheck(service.id);
  }

  private async _sendPingRequest(service: Service) {
    let startTime = performance.now();
    let status = (await this._sendHttpRequest(service.uri)).status;
    let latency = performance.now() - startTime;

    if (status === STATUS.NOT_ALLOWED.CODE) {
      startTime = performance.now();
      status = (await this._sendHttpRequest(service.uri)).status;
      latency = performance.now() - startTime;
    }
    if (status >= 200 && status < 300) {
      return { id: service.id, latency: Number(latency.toFixed(2)) };
    }

    return { id: service.id, latency: -1 };
  }

  private _sendBroadcastMessage(msg: { id: string; latency: number }) {
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
    this._monitorCheckCallback({ id: serviceId, uri: service.uri });
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

  private readonly _monitorCheckCallback = (service: {
    id: string;
    uri: string;
  }) => {
    // Not awaiting on purpose, I don't want to await for the completion since
    // I don't mind minor timing errors. With that said I don't want a
    // rejection to not be caught and handles, hence this is the result
    this._monitorCheck(service).catch((e) => {
      logger.error(e, 'Monitor check failed');
    });
  };

  /********************************************************************************/

  public insertMonitoredService(serviceId: string, service: ServiceData) {
    // On insert we need to start the schedule monitor since it does not exist
    this._monitorMap.set(serviceId, {
      name: service.name,
      uri: service.uri,
      interval: service.interval
    });

    this._monitorCheckCallback({ id: serviceId, uri: service.uri });
  }

  public updateMonitoredService(serviceId: string, service: ServiceData) {
    // On update, there's no need to start the schedule monitor since it already
    // exists
    this._monitorMap.set(serviceId, {
      name: service.name,
      uri: service.uri,
      interval: service.interval
    });
  }

  public deleteMonitoredService(serviceId: string) {
    this._monitorMap.delete(serviceId);
  }
}

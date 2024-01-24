import {
  WebSocket,
  WebSocketServer,
  ky,
  setTimeout,
  type Server,
  type ServiceData
} from '../types/index.js';
import { STATUS, logger } from '../utils/index.js';

/**********************************************************************************/

export default class {
  private readonly _wss;
  private readonly _monitorMap;
  private readonly _sendHttpRequest;

  public constructor(server: Server, monitorMap: Map<string, ServiceData>) {
    this._wss = new WebSocketServer({
      server: server,
      backlog: 512,
      maxPayload: 65_536,
      clientTracking: false
    });
    this._monitorMap = monitorMap;

    this._sendHttpRequest = ky.create({
      method: 'head',
      retry: 4,
      timeout: 8_000,
      throwHttpErrors: true
    });

    this._attachEventHandlers();
    this._scheduleMonitors();
  }

  private readonly _scheduleMonitors = () => {
    for (const [serviceId, service] of this._monitorMap) {
      void this._monitorCheck(serviceId, service.uri);
    }
  };

  private readonly _monitorCheck = async (
    serviceId: string,
    serviceUri: string
  ) => {
    const broadcastMsg = await this._sendPingRequest(serviceUri);
    this._sendBroadcastMessage(broadcastMsg);
    await this._rescheduleCheck(serviceId);
  };

  private readonly _sendPingRequest = async (serviceUri: string) => {
    let startTime = performance.now();
    let status = (await this._sendHttpRequest.head(serviceUri)).status;
    if (status === STATUS.NOT_ALLOWED.CODE) {
      startTime = performance.now();
      status = (await this._sendHttpRequest.get(serviceUri)).status;
    }
    const reqTime = performance.now() - startTime;

    if (status >= 200 && status < 300) {
      return { serviceUri: serviceUri, reqTime: Number(reqTime.toFixed(2)) };
    } else {
      return { serviceUri: serviceUri, reqTime: -1 };
    }
  };

  private readonly _sendBroadcastMessage = (msg: {
    serviceUri: string;
    reqTime: number;
  }) => {
    this._wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  };

  private readonly _rescheduleCheck = async (serviceId: string) => {
    const service = this._monitorMap.get(serviceId);
    if (!service) {
      return await Promise.resolve();
    }
    await setTimeout(service.interval);
    await this._monitorCheck(serviceId, service.uri);
  };

  private readonly _attachEventHandlers = () => {
    this._wss.on('error', (err) => {
      logger.error(err, 'Socket Server error');
    });

    this._wss.on('connection', (socket) => {
      console.log(socket);
      socket.on('error', (err) => {
        logger.error(err, 'Socket client error');
      });
    });
  };

  /********************************************************************************/

  public readonly upsertMonitoredService = (
    serviceId: string,
    service: ServiceData
  ) => {
    this._monitorMap.set(serviceId, {
      name: service.name,
      uri: service.uri,
      interval: service.interval
    });

    void this._monitorCheck(serviceId, service.uri);
  };

  public readonly deleteMonitoredService = (serviceId: string) => {
    this._monitorMap.delete(serviceId);
  };

  public readonly close = () => {
    this._wss.close((e) => {
      logger.error(e);
    });
  };
}

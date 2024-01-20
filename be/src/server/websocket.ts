import {
  WebSocket,
  WebSocketServer,
  ky,
  type Server,
  type ServiceData
} from '../types/index.js';
import { logger } from '../utils/index.js';

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
      clientTracking: true
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

  private readonly _attachEventHandlers = () => {
    this._wss.on('error', (err) => {
      logger.error(err, 'Socket Server error');
    });

    this._wss.on('connection', (socket) => {
      socket.on('error', (err) => {
        logger.error(err, 'Socket client error');
      });
    });
  };

  private readonly _scheduleMonitors = () => {
    for (const [key] of this._monitorMap) {
      void this._scheduleMonitor(key);
    }
  };

  private readonly _scheduleMonitor = async (serviceId: string) => {
    console.log(this._monitorMap);
    const service = this._monitorMap.get(serviceId);
    if (!service) {
      return await Promise.resolve();
    }

    await this._monitorCheck(service.uri);
    setTimeout(this._scheduleMonitor, service.interval, serviceId);
  };

  private readonly _monitorCheck = async (serviceUri: string) => {
    let msg: { serviceUri: string; reqTime: number } = {
      serviceUri: '',
      reqTime: 0
    };
    try {
      const startTime = performance.now();
      const { status } = await this._sendHttpRequest.head(serviceUri);
      const reqTime = performance.now() - startTime;

      if (status >= 200 && status < 300) {
        msg = { serviceUri: serviceUri, reqTime: Number(reqTime.toFixed(2)) };
      } else {
        msg = { serviceUri: serviceUri, reqTime: -1 };
      }
    } catch (err) {
      logger.error(err, 'Error during monitor check: ');

      msg = { serviceUri: serviceUri, reqTime: -1 };
    } finally {
      this._sendBroadcastMessage(msg);
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

    void this._scheduleMonitor(serviceId);
  };

  public readonly deleteMonitoredService = (serviceId: string) => {
    this._monitorMap.delete(serviceId);
  };

  public readonly close = () => {
    this._wss.close();
  };
}

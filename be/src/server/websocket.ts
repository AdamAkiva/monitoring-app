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

    this._attachEventHandlers();

    this._sendHttpRequest = ky.create({
      method: 'head',
      retry: 4,
      timeout: 8_000,
      throwHttpErrors: false
    });
  }

  private readonly _attachEventHandlers = () => {
    this._wss.on('error', (err) => {
      logger.error(err, 'Socket Server error');
    });

    this._wss.on('connection', (socket) => {
      socket.on('error', (err) => {
        logger.error(err, 'Socket client error');
      });

      void this._setBroadcast(socket);
    });
  };

  private readonly _setBroadcast = async (socket: WebSocket) => {
    const serviceIds = Array.from(this._monitorMap.keys());
    await Promise.all(
      serviceIds.map(async (id) => {
        await this._scheduleMonitor(id, socket);
      })
    );
  };

  private readonly _scheduleMonitor = async (
    serviceId: string,
    socket: WebSocket
  ) => {
    const entry = this._monitorMap.get(serviceId);
    if (!entry) {
      return await Promise.resolve();
    }

    const response = await this._monitorCheck(serviceId);
    this._wss.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(response));
      }
    });

    setTimeout(this._scheduleMonitor, entry.interval);
  };

  private readonly _monitorCheck = async (service: string) => {
    const startTime = performance.now();
    const { status } = await this._sendHttpRequest.head(service);
    const reqTime = performance.now() - startTime;

    if (status >= 200 && status < 300) {
      return { service: service, reqTime: reqTime };
    }

    return { service: service, reqTime: -1 };
  };

  public readonly close = () => {
    this._wss.close();
  };
}

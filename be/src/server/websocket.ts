import { WebSocket, WebSocketServer, ky, type Server } from '../types/index.js';
import { logger } from '../utils/index.js';

/**********************************************************************************/

export default class {
  private readonly _wss;
  private readonly _monitorMap;
  private readonly _sendHttpRequest;

  public constructor(server: Server, monitorMap: Map<string, number>) {
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
    const websites = Array.from(this._monitorMap.keys());
    await Promise.all(
      websites.map(async (website) => {
        await this._scheduleMonitor(website, socket);
      })
    );
  };

  private readonly _scheduleMonitor = async (
    website: string,
    socket: WebSocket
  ) => {
    const entry = this._monitorMap.get(website);
    if (!entry) {
      return await Promise.resolve();
    }

    const response = await this._monitorCheck(website);
    this._wss.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(response));
      }
    });

    setTimeout(this._scheduleMonitor, entry);
  };

  private readonly _monitorCheck = async (website: string) => {
    const startTime = performance.now();
    const { status } = await this._sendHttpRequest.head(website);
    const reqTime = performance.now() - startTime;

    if (status >= 200 && status < 300) {
      return { website: website, reqTime: reqTime };
    }

    return { website: website, reqTime: -1 };
  };

  public readonly close = () => {
    this._wss.close();
  };
}

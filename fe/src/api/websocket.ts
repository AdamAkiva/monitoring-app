import type { SetState } from '@/types';
import { getEnvValue, getRuntimeMode } from '@/utils';

/**********************************************************************************/

export default class WebsocketInstance {
  private static readonly DEFAULT_RECONNECT_ATTEMPTS = 16;
  private static readonly DEFAULT_RECONNECT_INTERVAL = 2000;
  private static readonly DEFAULT_THRESHOLD_DOUBLE_INTERVAL = 4;

  private readonly _setLatencyMap;
  private readonly _url;
  private readonly _allowedAttempts;
  private readonly _baseInterval;
  private readonly _doubleInterval;

  private _handler: WebSocket;
  private _currAttempt;
  private _currInterval;

  public constructor(params: {
    setLatencyMap: SetState<Map<string, number>>;
    url?: string;
    reconnect?: {
      attempts?: number;
      interval?: number;
      doubleInterval?: number;
    };
  }) {
    const {
      setLatencyMap,
      url = getEnvValue('WS_SERVER_URL'),
      reconnect: {
        attempts = WebsocketInstance.DEFAULT_RECONNECT_ATTEMPTS,
        interval = WebsocketInstance.DEFAULT_RECONNECT_INTERVAL,
        doubleInterval = WebsocketInstance.DEFAULT_THRESHOLD_DOUBLE_INTERVAL
      } = {}
    } = params;

    this._url = url;
    this._setLatencyMap = setLatencyMap;
    this._allowedAttempts = attempts;
    this._doubleInterval = doubleInterval;
    this._baseInterval = this._currInterval = interval;
    this._currAttempt = 0;

    // Bind the correct this instance to keep the correct this instance.
    // Another option is to make the eventHandler functions as arrow styles
    // instead, but I prefer doing this to be consistent with all other
    // class declarations
    this._createSocketConnection = this._createSocketConnection.bind(this);
    this._openEventHandler = this._openEventHandler.bind(this);
    this._errorEventHandler = this._errorEventHandler.bind(this);
    this._closeEventHandler = this._closeEventHandler.bind(this);
    this._messageEventHandler = this._messageEventHandler.bind(this);
    this.disconnect = this.disconnect.bind(this);

    this._handler = this._createSocketConnection();
  }

  private _createSocketConnection(reconnectAttempt?: number) {
    if (reconnectAttempt != null) {
      console.log(
        `Reconnect attempt: '${reconnectAttempt}/${this._allowedAttempts}'`
      );

      this._removeEventListeners();
    }
    if (getRuntimeMode() !== 'production') {
      console.warn(
        'A socket connection error may exist since react strict mode calls' +
          ' every hook twice'
      );
    }

    this._handler = new WebSocket(this._url);
    this._attachEventListeners();

    return this._handler;
  }

  /********************************************************************************/

  // See: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  private readonly _attachEventListeners = () => {
    this._handler.addEventListener('open', this._openEventHandler);
    this._handler.addEventListener('error', this._errorEventHandler);
    this._handler.addEventListener('close', this._closeEventHandler);
    this._handler.addEventListener('message', this._messageEventHandler);
  };

  // See: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
  private readonly _removeEventListeners = () => {
    this._handler.removeEventListener('open', this._openEventHandler);
    this._handler.removeEventListener('error', this._errorEventHandler);
    this._handler.removeEventListener('close', this._closeEventHandler);
    this._handler.removeEventListener('message', this._messageEventHandler);
  };

  /********************************************************************************/

  private _openEventHandler() {
    console.log('Socket connection established');
    this._currAttempt = 0;
    this._currInterval = this._baseInterval;
  }

  private _errorEventHandler(e: Event) {
    console.error(e);
  }

  private _closeEventHandler() {
    ++this._currAttempt;
    if (this._currAttempt > this._allowedAttempts) {
      return console.error('Attempt to reconnect failed');
    }
    // Every four attempt double reconnect interval
    if (this._currAttempt % this._doubleInterval === 0) {
      this._currInterval *= 2;
    }

    setTimeout(
      this._createSocketConnection,
      this._currInterval,
      this._currAttempt
    );
  }

  private _messageEventHandler(e: MessageEvent<string>) {
    const { id, latency } = JSON.parse(e.data) as {
      id: string;
      latency: number;
    };

    this._setLatencyMap((map) => {
      return new Map(map.set(id, latency));
    });
  }

  /********************************************************************************/

  public disconnect() {
    return () => {
      this._removeEventListeners();
      this._handler.close();
    };
  }
}

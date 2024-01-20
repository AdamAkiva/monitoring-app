import type { Dispatch, SetStateAction } from '@/types';
import { getEnvValue } from '../env.ts';

/**********************************************************************************/

export default class WebsocketInstance {
  private readonly _handler;
  private readonly _setLatency;

  public constructor(setLatency: Dispatch<SetStateAction<number>>) {
    this._handler = new WebSocket(getEnvValue('WS_SERVER_URL'));
    this._setLatency = setLatency;

    this._attachEventHandlers();
  }

  private readonly _attachEventHandlers = () => {
    this._handler.addEventListener('open', () => {
      console.log('Socket connection established');
    });
    this._handler.addEventListener('error', (e) => {
      console.error(e);
    });
    this._handler.addEventListener('close', () => {
      console.log('Socket connection closed');
    });
    this._handler.addEventListener('message', (e: MessageEvent<string>) => {
      this._setLatency(
        (JSON.parse(e.data) as { serviceId: string; reqTime: number }).reqTime
      );
    });
  };
}

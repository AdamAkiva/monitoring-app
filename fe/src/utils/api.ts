import { ky, type KyOptions, type RequiredFields } from '@/types';

import { getEnvValue } from './env.ts';

/**********************************************************************************/

export default class HttpRequest {
  private readonly _handler;
  private readonly _url;

  public constructor(url: string) {
    this._handler = ky.create({
      timeout: 8_000,
      throwHttpErrors: true,
      cache: 'default',
      retry: 4
    });
    this._url = url;
  }

  public readonly sendRequest = async <ReturnType = unknown>(
    options: RequiredFields<KyOptions, 'method'> = { method: 'get' }
  ) => {
    const res = await this._handler(this._url, options);

    const contentType = res.headers.get('content-type');
    if (!contentType) {
      return {
        data: '' as ReturnType,
        statusCode: res.status
      };
    }

    if (contentType.includes('application/json')) {
      return {
        data: (await res.json()) as ReturnType,
        statusCode: res.status
      };
    }
    if (contentType.includes('text/html')) {
      return {
        data: (await res.text()) as ReturnType,
        statusCode: res.status
      };
    }

    throw new Error('Unsupported content type');
  };
}

export const httpInstance = new HttpRequest(getEnvValue('SERVER_URL'));

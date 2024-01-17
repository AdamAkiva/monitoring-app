export default class MonitoringAppError extends Error {
  private readonly _msg;
  private readonly _code;

  public constructor(msg: string, code: number) {
    super(msg);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this._msg = msg;
    this._code = code;
  }

  public readonly getMessage = () => {
    return this._msg;
  };

  public readonly getCode = () => {
    return this._code;
  };
}

export abstract class BaseError extends Error {
  public readonly code?: string;
  public readonly httpStatus?: number;

  constructor(message: string, code?: string, httpStatus?: number) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

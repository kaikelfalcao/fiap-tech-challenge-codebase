import { v4 as uuidv4, validate as v4Validate } from 'uuid';

import { ValueObject } from '../value-object';

export class Identity extends ValueObject {
  private readonly _id: string;

  protected constructor(uuid: string) {
    super();
    if (!v4Validate(uuid)) {
      throw new Error(`Invalid UUID: ${uuid}`);
    }
    this._id = uuid;
  }
  public static generate() {
    return new Identity(uuidv4().toString());
  }

  public static fromString(uuid: string) {
    return new Identity(uuid);
  }

  get value() {
    return this._id;
  }

  public equals(other: ValueObject): boolean {
    return other instanceof Identity && this._id === other.value;
  }
}

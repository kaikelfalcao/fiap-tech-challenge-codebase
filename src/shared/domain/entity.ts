import type { Identity } from './value-objects/identity.vo';

export abstract class Entity {
  public abstract id(): Identity;

  public equals(other: Entity): boolean {
    return other instanceof Entity && this.id().equals(other.id());
  }
}

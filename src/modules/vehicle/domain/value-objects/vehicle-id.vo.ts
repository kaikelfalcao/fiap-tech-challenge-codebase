import { Identity } from '@/shared/domain/value-objects/identity.vo';

export class VehicleId extends Identity {
  static generate(): VehicleId {
    return super.generate() as VehicleId;
  }

  static fromString(value: string): VehicleId {
    return super.fromString(value) as VehicleId;
  }
}

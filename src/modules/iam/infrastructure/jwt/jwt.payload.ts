import type { Role } from '../../domain/value-objects/role.vo';

export interface JwtPayload {
  sub: string;
  taxId: string;
  name: string;
  role: Role;
}

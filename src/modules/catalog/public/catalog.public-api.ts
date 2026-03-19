export interface ServiceView {
  id: string;
  code: string;
  name: string;
  description: string;
  basePriceCents: number;
  estimatedDurationMinutes: number;
  active: boolean;
}

export interface ICatalogPublicApi {
  getServiceById(id: string): Promise<ServiceView | null>;
  getServiceByCode(code: string): Promise<ServiceView | null>;
  listActiveServices(): Promise<ServiceView[]>;
}

export const CATALOG_PUBLIC_API = Symbol('ICatalogPublicApi');

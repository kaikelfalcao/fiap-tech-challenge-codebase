export interface ItemStockView {
  id: string;
  code: string;
  name: string;
  type: 'PART' | 'SUPPLY';
  unit: string;
  unitPriceCents: number;
  stock: {
    quantity: number;
    reserved: number;
    available: number;
  };
}

export interface IInventoryPublicApi {
  getItemById(id: string): Promise<ItemStockView | null>;
  getItemByCode(code: string): Promise<ItemStockView | null>;
  reserveStock(
    itemId: string,
    amount: number,
    referenceId: string,
  ): Promise<void>;
  releaseStock(
    itemId: string,
    amount: number,
    referenceId: string,
  ): Promise<void>;
  consumeStock(
    itemId: string,
    amount: number,
    referenceId: string,
  ): Promise<void>;
}

export const INVENTORY_PUBLIC_API = Symbol('IInventoryPublicApi');

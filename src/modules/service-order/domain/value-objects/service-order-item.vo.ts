export interface ServiceOrderItemProps {
  itemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export class ServiceOrderItem {
  private constructor(private readonly props: ServiceOrderItemProps) {}

  static create(props: ServiceOrderItemProps): ServiceOrderItem {
    if (props.quantity <= 0) {
      throw new Error('Item quantity must be positive');
    }
    if (props.unitPriceCents < 0) {
      throw new Error('Item unit price must be non-negative');
    }
    return new ServiceOrderItem({ ...props });
  }

  static restore(props: ServiceOrderItemProps): ServiceOrderItem {
    return new ServiceOrderItem({ ...props });
  }

  get itemId(): string {
    return this.props.itemId;
  }
  get name(): string {
    return this.props.name;
  }
  get unitPriceCents(): number {
    return this.props.unitPriceCents;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get totalCents(): number {
    return this.props.unitPriceCents * this.props.quantity;
  }
}

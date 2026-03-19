export interface ServiceOrderServiceProps {
  serviceId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export class ServiceOrderService {
  private constructor(private readonly props: ServiceOrderServiceProps) {}

  static create(props: ServiceOrderServiceProps): ServiceOrderService {
    if (props.quantity <= 0) {
      throw new Error('Service quantity must be positive');
    }
    if (props.unitPriceCents < 0) {
      throw new Error('Service unit price must be non-negative');
    }
    return new ServiceOrderService({ ...props });
  }

  static restore(props: ServiceOrderServiceProps): ServiceOrderService {
    return new ServiceOrderService({ ...props });
  }

  get serviceId(): string {
    return this.props.serviceId;
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

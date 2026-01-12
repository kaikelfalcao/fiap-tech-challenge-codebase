import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleOrm } from '../entities/vehicle.orm';
import { VehicleRepository } from 'src/application/ports/vehicle.repository';
import { Vehicle } from 'src/domain/entities/vehicle.entity';
import { VehicleMapper } from '../mappers/vehicle.mapper';

export class TypeOrmVehicleRepository implements VehicleRepository {
  constructor(
    @InjectRepository(VehicleOrm)
    private readonly repo: Repository<VehicleOrm>,
  ) {}

  async save(vehicle: Vehicle): Promise<void> {
    const orm = VehicleMapper.toOrm(vehicle);

    const saved = await this.repo.save(orm);
    vehicle.id = saved.id;
    vehicle.createdAt = orm.createdAt;
    vehicle.updatedAt = orm.updatedAt;
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    const found = await this.repo.findOne({
      where: { plate },
      relations: ['customer'],
    });

    if (!found) {
      return null;
    }

    return VehicleMapper.toDomain(found);
  }

  async findById(id: string): Promise<Vehicle | null> {
    const found = await this.repo.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!found) {
      return null;
    }

    return VehicleMapper.toDomain(found);
  }

  async findAll(): Promise<Vehicle[]> {
    const found = await this.repo.find({ relations: ['customer'] });
    return found.map(VehicleMapper.toDomain);
  }

  async delete(id: string) {
    await this.repo.delete({ id: id });
  }
}

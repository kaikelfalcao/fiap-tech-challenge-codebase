import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRepositoryImpl } from '../../../../src/infrastructure/persistence/typeorm/repositories/customer.repository.impl';
import { Repository } from 'typeorm';
import { CreateCustomerUseCase } from '../../../../src/application/use-cases/customer/create-customer.usecase';
import { DeleteCustomerUseCase } from '../../../../src/application/use-cases/customer/delete-customer.usecase';
import { GetCustomerUseCase } from '../../../../src/application/use-cases/customer/get-customer.usecase';
import { GetCustomerByEmailUseCase } from '../../../../src/application/use-cases/customer/get-customer-by-email.usecase';
import { GetCustomerByDocumentUseCase } from '../../../../src/application/use-cases/customer/get-customer-by-document.usecase';
import { ListCustomersUseCase } from '../../../../src/application/use-cases/customer/list-customers.usecase';
import { UpdateCustomerUseCase } from '../../../../src/application/use-cases/customer/update-customer.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerTypeOrmEntity } from '../../../../src/infrastructure/persistence/typeorm/entities/customer.typeorm.entity';
import { CUSTOMER_REPOSITORY } from '../../../../src/infrastructure/nest/modules/tokens';
import { UUID } from 'node:crypto';

describe('Customer UseCases Integration', () => {
  let module: TestingModule;

  let repository: CustomerRepositoryImpl;
  let typeormRepo: Repository<CustomerTypeOrmEntity>;

  let createUseCase: CreateCustomerUseCase;
  let deleteUseCase: DeleteCustomerUseCase;
  let getUseCase: GetCustomerUseCase;
  let getByEmailUseCase: GetCustomerByEmailUseCase;
  let getByDocumentUseCase: GetCustomerByDocumentUseCase;
  let listUseCase: ListCustomersUseCase;
  let updateUseCase: UpdateCustomerUseCase;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [CustomerTypeOrmEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([CustomerTypeOrmEntity]),
      ],
      providers: [
        {
          provide: CUSTOMER_REPOSITORY,
          useClass: CustomerRepositoryImpl,
        },
        CreateCustomerUseCase,
        DeleteCustomerUseCase,
        GetCustomerUseCase,
        GetCustomerByEmailUseCase,
        GetCustomerByDocumentUseCase,
        ListCustomersUseCase,
        UpdateCustomerUseCase,
      ],
    }).compile();

    repository = module.get(CUSTOMER_REPOSITORY);
    typeormRepo = module.get('CustomerTypeOrmEntityRepository');

    createUseCase = module.get(CreateCustomerUseCase);
    deleteUseCase = module.get(DeleteCustomerUseCase);
    getUseCase = module.get(GetCustomerUseCase);
    getByEmailUseCase = module.get(GetCustomerByEmailUseCase);
    getByDocumentUseCase = module.get(GetCustomerByDocumentUseCase);
    listUseCase = module.get(ListCustomersUseCase);
    updateUseCase = module.get(UpdateCustomerUseCase);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create, get (by id/email/document), list, update and delete a customer', async () => {
    // CREATE
    const created = await createUseCase.execute({
      name: 'Kaike',
      email: 'kaike@test.com',
      document: '36801082060',
    });

    expect(created).toBeDefined();
    expect(created.name).toBe('Kaike');

    // GET by ID
    const foundById = await getUseCase.execute(created.id);
    expect(foundById.id).toBe(created.id);

    // GET by EMAIL
    const foundByEmail = await getByEmailUseCase.execute(created.email.value);
    expect(foundByEmail.email.value).toBe(created.email.value);

    // GET by DOCUMENT
    const foundByDocument = await getByDocumentUseCase.execute(
      created.document.value,
    );
    expect(foundByDocument.document.value).toBe(created.document.value);

    // LIST
    const list = await listUseCase.execute();
    expect(list.length).toBe(1);

    // UPDATE
    const updated = await updateUseCase.execute({
      id: <UUID>created.id,
      name: 'Kaike Updated',
    });
    expect(updated.name).toBe('Kaike Updated');

    // DELETE
    const deleted = await deleteUseCase.execute(created.id);
    expect(deleted).toBe(true);

    // GET after delete should throw
    await expect(getUseCase.execute(created.id)).rejects.toThrow();
    await expect(
      getByEmailUseCase.execute(created.email.value),
    ).rejects.toThrow();
    await expect(
      getByDocumentUseCase.execute(created.document.value),
    ).rejects.toThrow();
  });
});

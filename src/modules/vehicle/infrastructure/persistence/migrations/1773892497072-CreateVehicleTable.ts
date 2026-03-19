import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVehicleTable1773892497072 implements MigrationInterface {
  name = 'CreateVehicleTable1773892497072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "vehicles" ("id" uuid NOT NULL, "customer_id" uuid NOT NULL, "license_plate" character varying(7) NOT NULL, "brand" character varying(100) NOT NULL, "model" character varying(100) NOT NULL, "year" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7e9fab2e8625b63613f67bd706c" UNIQUE ("license_plate"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "vehicles"');
  }
}

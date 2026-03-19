import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomersTable1773877215218 implements MigrationInterface {
  name = 'CreateCustomersTable1773877215218';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "customers" ("id" uuid NOT NULL, "tax_id" character varying(14) NOT NULL, "full_name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(255) NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a1d20a1ca90c48dd400d9a2a6f" UNIQUE ("tax_id"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "customers"');
  }
}

import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalogTables1773935816492 implements MigrationInterface {
  name = 'CreateCatalogTables1773935816492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "catalog_services" ("id" uuid NOT NULL, "code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "description" text NOT NULL, "base_price" integer NOT NULL, "estimated_duration" integer NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_483eb8cb9a3d50b725d4eca0c48" UNIQUE ("code"), CONSTRAINT "PK_9e4aadc97608aa2eb56b027ae7e" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "catalog_services"');
  }
}

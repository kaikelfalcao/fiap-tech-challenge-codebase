import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryTables1773895109944 implements MigrationInterface {
  name = 'CreateInventoryTables1773895109944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TYPE "public"."inventory_items_type_enum" AS ENUM(\'PART\', \'SUPPLY\')',
    );
    await queryRunner.query(
      'CREATE TABLE "inventory_items" ("id" uuid NOT NULL, "code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "type" "public"."inventory_items_type_enum" NOT NULL, "unit" character varying(20) NOT NULL, "unit_price" integer NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0f18921d7116468ac6932644383" UNIQUE ("code"), CONSTRAINT "PK_cf2f451407242e132547ac19169" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      "CREATE TYPE \"public\".\"inventory_stock_movements_reason_enum\" AS ENUM('PURCHASE', 'ADJUSTMENT', 'RESERVATION', 'RELEASE', 'CONSUMPTION')",
    );
    await queryRunner.query(
      'CREATE TABLE "inventory_stock_movements" ("id" uuid NOT NULL, "stock_id" uuid NOT NULL, "quantity" integer NOT NULL, "reason" "public"."inventory_stock_movements_reason_enum" NOT NULL, "reference_id" character varying, "note" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_798fae89496e9e99ce4614b7101" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "inventory_stocks" ("id" uuid NOT NULL, "item_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT \'0\', "reserved" integer NOT NULL DEFAULT \'0\', "minimum" integer NOT NULL DEFAULT \'0\', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7ebe75a716a81b00766b6c81ae4" UNIQUE ("item_id"), CONSTRAINT "REL_7ebe75a716a81b00766b6c81ae" UNIQUE ("item_id"), CONSTRAINT "PK_092904cbd29becfe86bac755225" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'ALTER TABLE "inventory_stocks" ADD CONSTRAINT "FK_7ebe75a716a81b00766b6c81ae4" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "inventory_stocks" DROP CONSTRAINT "FK_7ebe75a716a81b00766b6c81ae4"',
    );
    await queryRunner.query('DROP TABLE "inventory_stocks"');
    await queryRunner.query('DROP TABLE "inventory_stock_movements"');
    await queryRunner.query(
      'DROP TYPE "public"."inventory_stock_movements_reason_enum"',
    );
    await queryRunner.query('DROP TABLE "inventory_items"');
    await queryRunner.query('DROP TYPE "public"."inventory_items_type_enum"');
  }
}

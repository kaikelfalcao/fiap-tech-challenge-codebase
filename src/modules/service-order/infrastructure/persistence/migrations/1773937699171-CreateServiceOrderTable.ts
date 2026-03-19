import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceOrderTable1773937699171 implements MigrationInterface {
  name = 'CreateServiceOrderTable1773937699171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"public\".\"service_orders_status_enum\" AS ENUM('RECEIVED', 'DIAGNOSIS', 'AWAITING_APPROVAL', 'IN_EXECUTION', 'FINALIZED', 'DELIVERED')",
    );
    await queryRunner.query(
      'CREATE TABLE "service_orders" ("id" uuid NOT NULL, "customer_id" uuid NOT NULL, "vehicle_id" uuid NOT NULL, "status" "public"."service_orders_status_enum" NOT NULL DEFAULT \'RECEIVED\', "services" jsonb NOT NULL DEFAULT \'[]\', "items" jsonb NOT NULL DEFAULT \'[]\', "budget_sent_at" TIMESTAMP WITH TIME ZONE, "approved_at" TIMESTAMP WITH TIME ZONE, "rejected_at" TIMESTAMP WITH TIME ZONE, "finalized_at" TIMESTAMP WITH TIME ZONE, "delivered_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_914aa74962ee83b10614ea2095d" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "service_orders"');
    await queryRunner.query('DROP TYPE "public"."service_orders_status_enum"');
  }
}

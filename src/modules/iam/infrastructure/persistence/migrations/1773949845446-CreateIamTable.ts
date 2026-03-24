import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIamTable1773949845446 implements MigrationInterface {
  name = 'CreateIamTable1773949845446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TYPE "public"."iam_users_role_enum" AS ENUM(\'ADMIN\', \'CUSTOMER\')',
    );
    await queryRunner.query(
      'CREATE TABLE "iam_users" ("id" uuid NOT NULL, "tax_id" character varying(14) NOT NULL, "name" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."iam_users_role_enum" NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_07fbba2edac21ff2056a7830892" UNIQUE ("tax_id"), CONSTRAINT "PK_02086c69f80fed8ae319ec498ec" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "iam_users"');
    await queryRunner.query('DROP TYPE "public"."iam_users_role_enum"');
  }
}

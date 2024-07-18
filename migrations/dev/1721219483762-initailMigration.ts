import { MigrationInterface, QueryRunner } from "typeorm";

export class InitailMigration1721219483762 implements MigrationInterface {
    name = 'InitailMigration1721219483762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "pairCreatedDate"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "pairCreatedDate" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "startGameDate"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "startGameDate" date`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "finishGameDate"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "finishGameDate" date`);
        await queryRunner.query(`ALTER TABLE "player" ALTER COLUMN "score" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" ALTER COLUMN "score" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "finishGameDate"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "finishGameDate" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "startGameDate"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "startGameDate" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "pairCreatedDate"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "pairCreatedDate" TIMESTAMP NOT NULL`);
    }

}

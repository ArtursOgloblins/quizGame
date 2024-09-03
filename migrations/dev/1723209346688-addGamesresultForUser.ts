import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGamesresultForUser1723209346688 implements MigrationInterface {
    name = 'AddGamesresultForUser1723209346688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" ADD "gameResult" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "gameResult"`);
    }

}

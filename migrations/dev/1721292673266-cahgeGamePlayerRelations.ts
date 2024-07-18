import { MigrationInterface, QueryRunner } from "typeorm";

export class CahgeGamePlayerRelations1721292673266 implements MigrationInterface {
    name = 'CahgeGamePlayerRelations1721292673266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" ADD "gameId" integer`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_0cf4e391785dd0e3e987d984944"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_462a3bdc7fc9e3782be61a6fb4d"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "REL_0cf4e391785dd0e3e987d98494"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "REL_462a3bdc7fc9e3782be61a6fb4"`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_0cf4e391785dd0e3e987d984944" FOREIGN KEY ("playerOneId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_462a3bdc7fc9e3782be61a6fb4d" FOREIGN KEY ("playerTwoId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_462a3bdc7fc9e3782be61a6fb4d"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_0cf4e391785dd0e3e987d984944"`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "REL_462a3bdc7fc9e3782be61a6fb4" UNIQUE ("playerTwoId")`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "REL_0cf4e391785dd0e3e987d98494" UNIQUE ("playerOneId")`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_462a3bdc7fc9e3782be61a6fb4d" FOREIGN KEY ("playerTwoId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_0cf4e391785dd0e3e987d984944" FOREIGN KEY ("playerOneId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "gameId"`);
    }

}

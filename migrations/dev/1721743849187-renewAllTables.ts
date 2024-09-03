import { MigrationInterface, QueryRunner } from "typeorm";

export class RenewAllTables1721743849187 implements MigrationInterface {
    name = 'RenewAllTables1721743849187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" SERIAL NOT NULL, "deviceName" character varying NOT NULL, "ip" character varying NOT NULL, "deviceId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiringAt" bigint NOT NULL, "userId" integer, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b5d765d6d98a87f3bb75d2a2d3" ON "refresh_token" ("ip") `);
        await queryRunner.query(`CREATE INDEX "IDX_b38c8203d43a8d64ab42e80453" ON "refresh_token" ("deviceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8e913e288156c133999341156a" ON "refresh_token" ("userId") `);
        await queryRunner.query(`CREATE TABLE "password_recovery" ("id" SERIAL NOT NULL, "confirmationCode" character varying NOT NULL, "isValid" boolean NOT NULL DEFAULT true, "expirationDate" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "REL_f5b57d414cf38032bbbe9ec578" UNIQUE ("userId"), CONSTRAINT "PK_104b7650227e31deb0f4c9e7d4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_496bfbe3ba7cd11c8ea1190dda" ON "password_recovery" ("confirmationCode") `);
        await queryRunner.query(`CREATE TABLE "questions" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "correctAnswers" text array NOT NULL, "published" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answers" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer, "questionId" integer, "gameQuestionId" integer, CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2db19a3852a73462e7532965c8" ON "answers" ("playerId") `);
        await queryRunner.query(`CREATE TABLE "game_questions" ("id" SERIAL NOT NULL, "questionIndex" integer NOT NULL, "gameId" integer, "questionId" integer, CONSTRAINT "PK_8655fa1f9639162ee24c3a5582a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "pairCreatedDate" date NOT NULL, "startGameDate" date, "finishGameDate" date, "playerOneId" integer, "playerTwoId" integer, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "player" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "score" integer NOT NULL DEFAULT '0', "userId" integer, "gameId" integer, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "login" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_confirmation" ("id" SERIAL NOT NULL, "confirmationCode" character varying NOT NULL, "isConfirmed" boolean NOT NULL DEFAULT false, "expirationDate" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "REL_239819b032e60ce34c265d8f8e" UNIQUE ("userId"), CONSTRAINT "PK_6413720700d03901d06d240b1bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_recovery" ADD CONSTRAINT "FK_f5b57d414cf38032bbbe9ec578d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_2db19a3852a73462e7532965c82" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_c38697a57844f52584abdb878d7" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_f1b281f902ff09f496100936646" FOREIGN KEY ("gameQuestionId") REFERENCES "game_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_a0545c377fe4b81dfb82497b19a" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_0cf4e391785dd0e3e987d984944" FOREIGN KEY ("playerOneId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_462a3bdc7fc9e3782be61a6fb4d" FOREIGN KEY ("playerTwoId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_7687919bf054bf262c669d3ae21" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_confirmation" ADD CONSTRAINT "FK_239819b032e60ce34c265d8f8e8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_confirmation" DROP CONSTRAINT "FK_239819b032e60ce34c265d8f8e8"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_7687919bf054bf262c669d3ae21"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_462a3bdc7fc9e3782be61a6fb4d"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_0cf4e391785dd0e3e987d984944"`);
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_2f2de5b0489bd9ecea902b3c3e6"`);
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_a0545c377fe4b81dfb82497b19a"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_f1b281f902ff09f496100936646"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_c38697a57844f52584abdb878d7"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_2db19a3852a73462e7532965c82"`);
        await queryRunner.query(`ALTER TABLE "password_recovery" DROP CONSTRAINT "FK_f5b57d414cf38032bbbe9ec578d"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`);
        await queryRunner.query(`DROP TABLE "users_confirmation"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "player"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TABLE "game_questions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2db19a3852a73462e7532965c8"`);
        await queryRunner.query(`DROP TABLE "answers"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_496bfbe3ba7cd11c8ea1190dda"`);
        await queryRunner.query(`DROP TABLE "password_recovery"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e913e288156c133999341156a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b38c8203d43a8d64ab42e80453"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5d765d6d98a87f3bb75d2a2d3"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }

}

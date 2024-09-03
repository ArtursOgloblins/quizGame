import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUpdateQuestionNulable1722263284964 implements MigrationInterface {
    name = 'MakeUpdateQuestionNulable1722263284964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "updatedAt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "updatedAt" SET NOT NULL`);
    }

}

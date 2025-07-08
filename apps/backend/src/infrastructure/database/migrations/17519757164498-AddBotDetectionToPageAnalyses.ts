import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBotDetectionToPageAnalyses17519757164498 implements MigrationInterface {
  name = 'AddBotDetectionToPageAnalyses17519757164498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "page_analyses" 
      ADD COLUMN "bot_detection" jsonb NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "page_analyses" 
      DROP COLUMN "bot_detection"
    `);
  }
}

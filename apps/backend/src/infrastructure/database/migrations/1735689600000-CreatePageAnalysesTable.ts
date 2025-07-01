import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePageAnalysesTable1735689600000 implements MigrationInterface {
  name = 'CreatePageAnalysesTable1735689600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the page_analyses table
    await queryRunner.createTable(
      new Table({
        name: 'page_analyses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          {
            name: 'url',
            type: 'varchar',
            length: '2048',
            isNullable: false
          },
          {
            name: 'options_hash',
            type: 'varchar',
            length: '64',
            isNullable: false
          },
          {
            name: 'analysis_timestamp',
            type: 'timestamp',
            isNullable: false
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'duration',
            type: 'integer',
            isNullable: false
          },
          {
            name: 'g_co2e',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: false
          },
          {
            name: 'options',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'resources',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'green_hosting',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'human_readable_impact',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true
          }
        ],
        indices: [
          {
            name: 'idx_page_analyses_url_options_hash',
            columnNames: ['url', 'options_hash']
          },
          {
            name: 'idx_page_analyses_url',
            columnNames: ['url']
          },
          {
            name: 'idx_page_analyses_created_at',
            columnNames: ['created_at']
          },
          {
            name: 'idx_page_analyses_expires_at',
            columnNames: ['expires_at']
          }
        ]
      }),
      true
    );

    // Create trigger function for updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for updated_at timestamp
    await queryRunner.query(`
      CREATE TRIGGER update_page_analyses_updated_at 
          BEFORE UPDATE ON page_analyses 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_page_analyses_updated_at ON page_analyses;
    `);

    // Drop trigger function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    // Drop table (this will automatically drop indexes)
    await queryRunner.dropTable('page_analyses');
  }
}

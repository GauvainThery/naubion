/**
 * TypeORM DataSource configuration
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getConfig } from '../../config/index.js';
import { PageAnalysisEntity } from './entities/page-analysis.entity.js';

// Get database configuration
const dbConfig = getConfig<{
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}>('database');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: dbConfig.synchronize,
  logging: dbConfig.logging,
  entities: [PageAnalysisEntity],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  subscribers: ['src/infrastructure/database/subscribers/*.ts']
});

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');

    // Run migrations if needed (when synchronize is disabled)
    if (!dbConfig.synchronize) {
      const { checkMigrationsNeeded, runMigrations } = await import('./migration-runner.js');
      const needsMigrations = await checkMigrationsNeeded();

      if (needsMigrations) {
        console.log('📊 Running database migrations...');
        await runMigrations();
      } else {
        console.log('✅ Database schema is up to date');
      }
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error during database closure:', error);
    throw error;
  }
};

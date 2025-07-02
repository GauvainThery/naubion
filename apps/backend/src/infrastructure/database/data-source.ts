/**
 * TypeORM DataSource configuration
 */

import { DataSource } from 'typeorm';
import { getConfig } from '../../config/index.js';
import { PageAnalysisEntity } from './entities/page-analysis.entity.js';
import { checkMigrationsNeeded, runMigrations } from './migration-runner.js';

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
  migrations: [
    // Always use compiled JavaScript files for migrations
    'dist/infrastructure/database/migrations/*.js'
  ],
  subscribers: []
});

/**
 * Initialize database connection with retry mechanism
 */
export const initializeDatabase = async (): Promise<void> => {
  const maxRetries = 10;
  const retryDelay = 3000; // 3 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');

      // Run migrations if needed (when synchronize is disabled)
      if (!dbConfig.synchronize) {
        const needsMigrations = await checkMigrationsNeeded();

        if (needsMigrations) {
          console.log('📊 Running database migrations...');
          await runMigrations();
        } else {
          console.log('✅ Database schema is up to date');
        }
      }

      // If we get here, connection was successful
      return;
    } catch (error) {
      console.log(
        `❌ Database connection attempt ${attempt}/${maxRetries} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt === maxRetries) {
        console.error('❌ Error during database initialization:', error);
        throw error;
      }

      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
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

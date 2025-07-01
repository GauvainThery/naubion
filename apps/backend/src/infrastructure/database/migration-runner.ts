/**
 * Database migration runner using TypeORM
 * Manages database schema evolution through TypeORM migrations
 */

import { AppDataSource } from './data-source.js';
import logger from '../../shared/logger.js';

/**
 * Run pending database migrations using TypeORM
 */
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting TypeORM database migrations...');

    // Get pending migrations
    const pendingMigrations = await AppDataSource.showMigrations();

    if (pendingMigrations) {
      logger.info(`Found ${pendingMigrations} pending migration(s)`);

      // Run all pending migrations
      await AppDataSource.runMigrations();

      logger.info('✅ Database migrations completed successfully');
    } else {
      logger.info('✅ No pending migrations found');
    }
  } catch (error) {
    logger.error('❌ Error running database migrations:', { error: String(error) });
    throw error;
  }
}

/**
 * Check if migrations need to be run
 */
export async function checkMigrationsNeeded(): Promise<boolean> {
  try {
    const pendingMigrations = await AppDataSource.showMigrations();
    return pendingMigrations;
  } catch (error) {
    logger.error('❌ Error checking migration status:', { error: String(error) });
    // If we can't check, assume migrations are needed for safety
    return true;
  }
}

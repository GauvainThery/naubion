/**
 * Database migration runner
 * Executes SQL migrations to set up database schema
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AppDataSource } from './data-source.js';
import logger from '../../shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');

    // Read the migration SQL file
    const migrationPath = join(__dirname, 'migrations', '001-create-page-analyses-table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await AppDataSource.query(migrationSQL);

    logger.info('✅ Database migrations completed successfully');
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
    // Check if page_analyses table exists
    const result = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'page_analyses'
      );
    `);

    return !result[0].exists;
  } catch (error) {
    logger.warn('Could not check migration status, assuming migrations needed:', {
      error: String(error)
    });
    return true;
  }
}

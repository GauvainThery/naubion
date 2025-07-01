import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'naubion',
  password: process.env.DB_PASSWORD || 'naubion_password',
  database: process.env.DB_DATABASE || 'naubion',
  synchronize: false, // Always false for production
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/infrastructure/database/entities/*.ts'],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations'
});

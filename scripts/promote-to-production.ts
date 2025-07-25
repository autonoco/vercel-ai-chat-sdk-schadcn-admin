#!/usr/bin/env tsx

import { config } from 'dotenv';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';

const execAsync = promisify(exec);

// Load environment variables
config({ path: '.env.local' });

async function main() {
  console.log('🚀 Database Promotion Script');
  console.log('============================\n');

  // Check if we have the necessary environment variables
  if (!process.env.POSTGRES_URL_STAGING || !process.env.POSTGRES_URL_PROD) {
    console.error('❌ Error: Missing required environment variables');
    console.error('Please ensure POSTGRES_URL_STAGING and POSTGRES_URL_PROD are set');
    process.exit(1);
  }

  try {
    // Step 1: Create a backup of production database
    console.log('📦 Creating production database backup...');
    const backupFile = `backup-prod-${new Date().toISOString().replace(/:/g, '-')}.sql`;
    await execAsync(
      `pg_dump "${process.env.POSTGRES_URL_PROD}" > ${backupFile}`
    );
    console.log(`✅ Backup created: ${backupFile}\n`);

    // Step 2: Compare schemas between staging and production
    console.log('🔍 Comparing database schemas...');
    const stagingSchema = await getSchema(process.env.POSTGRES_URL_STAGING);
    const prodSchema = await getSchema(process.env.POSTGRES_URL_PROD);
    
    if (stagingSchema === prodSchema) {
      console.log('✅ Schemas are identical. No migration needed.\n');
      return;
    }

    // Step 3: Generate migration SQL
    console.log('📝 Generating migration SQL...');
    const migrationSQL = await generateMigrationSQL();
    const migrationFile = `migration-${Date.now()}.sql`;
    await fs.writeFile(migrationFile, migrationSQL);
    console.log(`✅ Migration SQL saved to: ${migrationFile}\n`);

    // Step 4: Apply migrations to production
    console.log('🔄 Applying migrations to production...');
    console.log('⚠️  This will modify the production database. Continue? (y/N)');
    
    const readline = require('node:readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      readline.question('', (answer: string) => {
        readline.close();
        resolve(answer);
      });
    });

    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Migration cancelled');
      process.exit(0);
    }

    // Apply the migration
    await execAsync(
      `psql "${process.env.POSTGRES_URL_PROD}" < ${migrationFile}`
    );
    console.log('✅ Migrations applied successfully!\n');

    // Step 5: Verify the migration
    console.log('🔍 Verifying migration...');
    const newProdSchema = await getSchema(process.env.POSTGRES_URL_PROD);
    if (newProdSchema === stagingSchema) {
      console.log('✅ Production database successfully updated!\n');
    } else {
      console.log('⚠️  Warning: Schemas still differ after migration');
      console.log('Please review the migration and try again');
    }

  } catch (error) {
    console.error('❌ Error during promotion:', error);
    process.exit(1);
  }
}

async function getSchema(connectionString: string): Promise<string> {
  const { stdout } = await execAsync(
    `pg_dump --schema-only "${connectionString}" | grep -v "^--" | grep -v "^$"`
  );
  return stdout.trim();
}

async function generateMigrationSQL(): Promise<string> {
  // This is a placeholder. In a real implementation, you would:
  // 1. Use a tool like migra or pg-diff to generate the SQL
  // 2. Or use Drizzle's migration generation capabilities
  // 3. Or implement your own schema comparison logic
  
  console.log('⚠️  Note: Using Drizzle migrations from lib/db/migrations/');
  console.log('Make sure all staging migrations have been generated and tested');
  
  // Read the latest migration files
  const migrationsDir = path.join(process.cwd(), 'lib/db/migrations');
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
  
  if (sqlFiles.length === 0) {
    throw new Error('No migration files found');
  }
  
  // Read the latest migration
  const latestMigration = sqlFiles[sqlFiles.length - 1];
  const migrationContent = await fs.readFile(
    path.join(migrationsDir, latestMigration),
    'utf-8'
  );
  
  return migrationContent;
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
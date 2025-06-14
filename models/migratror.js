import migrationRunner from "node-pg-migrate";
import database from "infra/database";
import { resolve } from "node:path";
import { ServiceError } from "infra/errors";

const defaultMigrationOptions = {
  direction: process.env.MIGRATION_DIRECTION || "up",
  migrationsTable: process.env.MIGRATIONS_TABLE || "pgmigrations",
  dir: resolve(process.env.MIGRATIONS_DIR || "infra/migrations"),
};

async function runMigrations({ dryRun } = { dryRun: true }) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun,
    });
    return migratedMigrations;
  } catch (error) {
    console.error("> [ERROR] Migration failed:", error);
    const serviceErrorObject = new ServiceError({
      cause: error,
      message: "Database migration failed",
    });
    throw serviceErrorObject;
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}

const migrator = {
  runPendingMigrations: () => runMigrations({ dryRun: false }),
  listPendingMigrations: () => runMigrations({ dryRun: true }),
};

export default migrator;

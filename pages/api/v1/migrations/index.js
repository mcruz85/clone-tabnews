import migrationRunner from "node-pg-migrate";
import { createRouter } from "next-connect";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "infra/shared/controller";

const router = createRouter();
const DRY_RUN = true;
const EXECUTE_MIGRATION = false;

const defaultMigrationOptions = {
  direction: process.env.MIGRATION_DIRECTION || "up",
  migrationsTable: process.env.MIGRATIONS_TABLE || "pgmigrations",
  dir: resolve(process.env.MIGRATIONS_DIR || "infra/migrations"),
};

async function runMigrations(dryRun) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun,
    });
    return migratedMigrations;
  } finally {
    if (dbClient) await dbClient.end();
  }
}

async function migrationHandler(req, res, dryRun) {
  const migratedMigrations = await runMigrations(dryRun);
  const status = migratedMigrations.length === 0 ? 200 : dryRun ? 200 : 201;
  res.status(status).json(migratedMigrations);
}

function getHandler(req, res) {
  return migrationHandler(req, res, DRY_RUN);
}

function postHandler(req, res) {
  return migrationHandler(req, res, EXECUTE_MIGRATION);
}

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";

export default async function migrations(req, res) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const dryRun = req.method === "GET" ? true : false;
    const migrationsOptions = getMigrationOptions(dbClient, dryRun);
    const migratedMigrations = await migrationRunner(migrationsOptions);
    const status = !dryRun && migratedMigrations.length > 0 ? 201 : 200;
    return res.status(status).json(migratedMigrations);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}

function getMigrationOptions(dbClient, dryRun) {
  return {
    dbClient: dbClient,
    dir: resolve("infra", "migrations"),
    direction: "up",
    dryRun: dryRun,
    migrationsTable: "pgmigrations",
  };
}

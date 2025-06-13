import { createRouter } from "next-connect";
import controller from "infra/shared/controller";
import migrator from "models/migratror";

const router = createRouter();

async function getHandler(req, res) {
  const listPendingMigrations = await migrator.listPendingMigrations();
  return res.status(200).json(listPendingMigrations);
}

async function postHandler(req, res) {
  const migratedMigrations = await migrator.runPendingMigrations();
  const status = migratedMigrations.length === 0 ? 200 : 201;
  res.status(status).json(migratedMigrations);
}

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

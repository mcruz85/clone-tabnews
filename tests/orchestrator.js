import { faker } from "@faker-js/faker/.";
import retry from "async-retry";
import database from "infra/database.js";
import migrator from "models/migratror.js";
import user from "models/user.js";

async function waitForAppToStart() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      minTimeout: 2000,
      factor: 1,
      onRetry: (error, attempt) =>
        console.log(`Attempt ${attempt} failed: ${error.message}`),
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3020/api/v1/status");
      if (response.status !== 200) {
        throw new Error("App is not ready yet");
      }
    }
  }
}

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObect) {
  return await user.create({
    username:
      userObect.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObect.email || faker.internet.email(),
    password: userObect.password || "P@ssw0rd",
  });
}

const orchestrator = {
  waitForAppToStart,
  cleanDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;

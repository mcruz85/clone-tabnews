import database from "infra/database";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAppToStart();
  await cleanDatabase();
});

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function testMethod(method) {
  const response = await fetch("http://localhost:3020/api/v1/migrations", {
    method,
  });

  return response.status;
}

describe("/api/v1/migrations", () => {
  const notAllowedMethods = ["PUT", "DELETE", "OPTIONS", "PATCH"];

  test.each(notAllowedMethods)(
    "should return 405 when using %s method",
    async (method) => {
      const status = await testMethod(method);
      expect(status).toBe(405);
    },
  );
});

import database from "infra/database";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAppToStart();
  await cleanDatabase();
});

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const firstResponse = await fetch(
          "http://localhost:3020/api/v1/migrations",
          {
            method: "POST",
          },
        );

        const responseBody = await firstResponse.json();
        expect(firstResponse.status).toBe(201);
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });

      test("For the second time", async () => {
        const secondResponse = await fetch(
          "http://localhost:3020/api/v1/migrations",
          {
            method: "POST",
          },
        );

        const secondResponseBody = await secondResponse.json();
        expect(secondResponse.status).toBe(200);
        expect(Array.isArray(secondResponseBody)).toBe(true);
        expect(secondResponseBody.length).toBe(0);
      });
    });
  });
});

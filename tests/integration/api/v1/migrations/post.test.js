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
  var response;

  beforeAll(async () => {
    response = await fetch("http://localhost:3020/api/v1/migrations", {
      method: "POST",
    });
  });

  test("should return staus 201", () => {
    expect(response.status).toBe(201);
  });

  test("should execute pending migrations", async () => {
    const responseBody = await response.json();
    expect(response.status).toBe(201);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

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

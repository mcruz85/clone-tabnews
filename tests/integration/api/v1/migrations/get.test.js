import database from "infra/database";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

describe("GET /api/v1/migrations", () => {
  var response;

  beforeAll(async () => {
    response = await fetch("http://localhost:3020/api/v1/migrations");
  });

  test("should return staus 200", () => {
    expect(response.status).toBe(200);
  });

  test("should return an array", async () => {
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);
  });
});

import database from "infra/database";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function testMethod(method) {
  const response = await fetch("http://localhost:3020/api/v1/migrations", {
    method: method,
  });

  return response.status;
}

describe("/api/v1/migrations", () => {
  test("other http methods to /api/v1/migrations should return 405", async () => {
    const notAllowedMethods = ["HEAD", "PUT", "DELETE", "OPTIONS", "PATCH"];
    for (const method of notAllowedMethods) {
      const status = await testMethod(method);
  
      expect(status).toBe(405);
    }
  });
});

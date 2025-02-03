import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAppToStart();
  await orchestrator.cleanDatabase();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    var response;
    var payload;
    var database;

    beforeAll(async () => {
      response = await fetch("http://localhost:3020/api/v1/status");
      payload = await response.json();
      database = payload.database;
    });

    test("Retriving current system status", () => {
      expect(response.status).toBe(200);
      const parsedUpdateAt = new Date(payload.update_at).toISOString();
      expect(parsedUpdateAt).toBe(payload.update_at);
    });

    test("Validating database properties", () => {
      expect(database.version).toBeDefined();
      expect(typeof database.version).toBe("string");
      expect(database.version).toBe("16.3");

      expect(database.max_connections).toBeDefined();
      expect(typeof database.max_connections).toBe("number");

      expect(database.opened_connections).toBeDefined();
      expect(typeof database.opened_connections).toBe("number");
      expect(database.opened_connections).toBe(1);
    });
  });
});

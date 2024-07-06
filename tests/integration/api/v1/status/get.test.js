import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAppToStart();
});


describe("GET /api/v1/status", () => {
  var response;
  var payload;

  beforeAll(async () => {
    response = await fetch("http://localhost:3020/api/v1/status");
    payload = await response.json();
  });

  test("should return staus 200", () => {
    expect(response.status).toBe(200);
  });

  test("should return valid updated_at as ISO string", () => {
    const parsedUpdateAt = new Date(payload.update_at).toISOString();
    expect(parsedUpdateAt).toBe(payload.update_at);
  });
});

describe("Verify GET /api/v1/status database payload", () => {
  var response;
  var database;

  beforeAll(async () => {
    await orchestrator.waitForAppToStart();
    response = await fetch("http://localhost:3020/api/v1/status");
    database = (await response.json()).database;
  });

  test("should return a valid postgres version", () => {
    expect(database.version).toBeDefined();
    expect(typeof database.version).toBe("string");
    expect(database.version).toBe("16.3");
  });

  test("should return a valid max connections", () => {
    expect(database.max_connections).toBeDefined();
    expect(typeof database.max_connections).toBe("number");
  });

  test("should return a valid opened connections", () => {
    expect(database.opened_connections).toBeDefined();
    expect(typeof database.opened_connections).toBe("number");
    expect(database.opened_connections).toBe(1);
  });
});

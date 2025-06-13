import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAppToStart();
  await orchestrator.cleanDatabase();
});

describe("POST /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Should return HTTP code 405", async () => {
      const response = await fetch("http://localhost:3020/api/v1/status", {
        method: "POST",
      });

      expect(response.status).toBe(405);

      const payload = await response.json();
      console.log(payload);
      expect(payload).toEqual({
        name: "MethodNotAllowedError",
        message: 'Method "POST" not allowed',
        action: "Verify the allowed methods for the endpoint",
        status_code: 405,
      });
    });
  });
});

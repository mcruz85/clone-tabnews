import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import { createUser } from "tests/helpers/user.js";

beforeAll(async () => {
  await orchestrator.waitForAppToStart();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const response = await createUser({
        username: "MesmoCase",
        email: "mesmo.case@mail.com",
        password: "P@ssw0rd",
      });
      expect(response.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3020/api/v1/users/MesmoCase",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "MesmoCase",
        email: "mesmo.case@mail.com",
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test("With case missmatch", async () => {
      const response = await createUser({
        username: "CaseInsensitive",
        email: "case.insensitive@mail.com",
        password: "P@ssw0rd",
      });
      expect(response.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3020/api/v1/users/caseinsensitive",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "CaseInsensitive",
        email: "case.insensitive@mail.com",
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test("Non-existing username", async () => {
      const response = await fetch(
        "http://localhost:3020/api/v1/users/unknownuser",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "User 'unknownuser' not found",
        action: "Please check the username and try again",
        status_code: 404,
      });
    });
  });
});

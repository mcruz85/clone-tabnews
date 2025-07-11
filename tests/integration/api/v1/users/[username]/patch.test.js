import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import password from "models/password";
import database from "infra/database";

beforeAll(async () => {
  await orchestrator.waitForAppToStart();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With non-existing 'username'", async () => {
      const response = await fetch(
        "http://localhost:3020/api/v1/users/unknown",
        {
          method: "PATCH",
        },
      );
      expect(response.status).toBe(404);
    });

    test("With duplicate 'username'", async () => {
      const createdUser1 = await orchestrator.createUser({
        email: "user1@mail.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "user2@mail.com",
      });

      const response = await fetch(
        `http://localhost:3020/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: createdUser1.username }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username already exists",
        action: "Please use a different username",
        status_code: 400,
      });
    });

    test("With duplicate 'email'", async () => {
      const createdUser1 = await orchestrator.createUser({
        email: "email1@mail.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@mail.com",
      });

      const response = await fetch(
        `http://localhost:3020/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: createdUser1.email }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email already exists",
        action: "Please use a different email",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueUser1",
      });

      const response = await fetch(
        `http://localhost:3020/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "uniqueUser2" }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: createdUser.email,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(
        new Date(responseBody.updated_at) > new Date(responseBody.created_at),
      ).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({});

      const response = await fetch(
        `http://localhost:3020/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: "newPassword" }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(
        new Date(responseBody.updated_at) > new Date(responseBody.created_at),
      ).toBe(true);

      const resultSet = await database.query({
        text: "SELECT * FROM users WHERE id=$1 LIMIT 1",
        values: [responseBody.id],
      });

      const userInDatabase = resultSet.rows[0];

      const correctPasswordMatch = await password.compare(
        "newPassword",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "P@ssw0rd",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});

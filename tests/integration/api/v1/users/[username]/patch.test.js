import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import { createUser } from "tests/helpers/user.js";
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
      const user1response = await createUser({
        username: "user1",
        email: "user1@mail.com",
        password: "P@ssw0rd",
      });
      expect(user1response.status).toBe(201);

      const user2response = await createUser({
        username: "user2",
        email: "user2@mail.com",
        password: "P@ssw0rd",
      });
      expect(user2response.status).toBe(201);

      const response = await fetch("http://localhost:3020/api/v1/users/user2", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "user1" }),
      });

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
      const user1response = await createUser({
        username: "email1",
        email: "email1@mail.com",
        password: "P@ssw0rd",
      });
      expect(user1response.status).toBe(201);

      const user2response = await createUser({
        username: "email2",
        email: "email2@mail.com",
        password: "P@ssw0rd",
      });
      expect(user2response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3020/api/v1/users/email2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "email1@mail.com" }),
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
      const user1response = await createUser({
        username: "uniqueUser1",
        email: "uniqueUser1@mail.com",
        password: "P@ssw0rd",
      });
      expect(user1response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3020/api/v1/users/uniqueUser1",
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
        email: "uniqueUser1@mail.com",
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
      const user1response = await createUser({
        username: "newPasswordUser1",
        email: "newpassword@mail.com",
        password: "P@ssw0rd",
      });
      expect(user1response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3020/api/v1/users/newPasswordUser1",
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
        username: "newPasswordUser1",
        email: "newpassword@mail.com",
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

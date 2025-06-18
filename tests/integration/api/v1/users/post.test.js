import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import database from "infra/database";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAppToStart();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

async function createUser({ username, email, password }) {
  const response = await fetch("http://localhost:3020/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return response;
}

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await createUser({
        username: "johndoe",
        email: "user@mail.com",
        password: "P@ssw0rd",
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "johndoe",
        email: "user@mail.com",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const resultSet = await database.query({
        text: "SELECT * FROM users WHERE id=$1 LIMIT 1",
        values: [responseBody.id],
      });

      const userInDatabase = resultSet.rows[0];

      const correctPasswordMatch = await password.compare(
        "P@ssw0rd",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "wrongpassword",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicate 'email'", async () => {
      const response1 = await createUser({
        username: "uniqueuser",
        email: "duplicated@mail.com",
        password: "P@ssw0rd",
      });

      expect(response1.status).toBe(201);

      const response2 = await createUser({
        username: "uniqueuserb",
        email: "duplicated@mail.com",
        password: "P@ssw0rd",
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Email already exists",
        action: "Please use a different email",
        status_code: 400,
      });
    });

    test("With duplicate 'username'", async () => {
      const response1 = await createUser({
        username: "johndoeX",
        email: "email10@mail.com",
        password: "P@ssw0rd",
      });

      expect(response1.status).toBe(201);

      const response2 = await createUser({
        username: "johndoeX",
        email: "email11@mail.com",
        password: "P@ssw0rd",
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Username already exists",
        action: "Please use a different username",
        status_code: 400,
      });
    });
    describe("Missing required fields", () => {
      const requiredFields = [
        {
          missing: "email",
          payload: { username: "johndoeY", password: "P@ssw0rd" },
        },
        {
          missing: "username",
          payload: { email: "mail@mail.com", password: "P@ssw0rd" },
        },
        {
          missing: "password",
          payload: { username: "johndoeY", email: "mail@mail.com" },
        },
      ];

      const expectedError = {
        name: "ValidationError",
        message: "Missing required fields",
        action: "Please provide username, email, and password",
        status_code: 400,
      };

      test.each(requiredFields)(
        "should return 400 when $missing is missing",
        async ({ payload }) => {
          const response = await createUser(payload);
          expect(response.status).toBe(400);
          const responseBody = await response.json();
          expect(responseBody).toEqual(expectedError);
        },
      );
    });
  });
});

describe("POST /api/v1/users/[username]", () => {
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
        message: "User not found",
        action: "Please check the username and try again",
        status_code: 404,
      });
    });
  });
});

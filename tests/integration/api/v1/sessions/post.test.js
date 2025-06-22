import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAppToStart();
});

beforeEach(async () => {
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorret `email` but corret `password`", async () => {
      await orchestrator.createUser({
        password: "correct_password",
      });

      const response = await fetch("http://localhost:3020/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "wrong.email@mail.com",
          password: "correct_password",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();

      console.log(responseBody);

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password",
        action: "Please check the credentials and try again",
        status_code: 401,
      });
    });

    test("With correct `email` but incorret `password`", async () => {
      await orchestrator.createUser({
        email: "correct@mail.com",
      });

      const response = await fetch("http://localhost:3020/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "correct@mail.com",
          password: "incorrect_password",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password",
        action: "Please check the credentials and try again",
        status_code: 401,
      });
    });

    test("With incorrect `email` and incorret `password`", async () => {
      await orchestrator.createUser({});

      const response = await fetch("http://localhost:3020/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "correct@mail.com",
          password: "incorrect_password",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password",
        action: "Please check the credentials and try again",
        status_code: 401,
      });
    });

    test("With correct `email` and corret `password`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "correct@mail.com",
        password: "correct_password",
      });

      const response = await fetch("http://localhost:3020/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "correct@mail.com",
          password: "correct_password",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      console.log(parsedSetCookie);

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});

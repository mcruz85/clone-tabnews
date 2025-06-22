import { createRouter } from "next-connect";
import controller from "infra/shared/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";
import * as cookie from "cookie";

const router = createRouter();

async function postHandler(req, res) {
  const userInputValues = req.body || {};

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);
  console.log("newSession", newSession);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.setHeader("Set-Cookie", setCookie);

  res.status(201).json(newSession);
}

router.post(postHandler);

export default router.handler(controller.errorHandlers);

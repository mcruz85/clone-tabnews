import { createRouter } from "next-connect";
import controller from "infra/shared/controller.js";
import user from "models/user.js";

const router = createRouter();

async function postHandler(req, res) {
  const userInputValues = req.body || {};
  const newUser = await user.create(userInputValues);

  res.status(201).json(newUser);
}

router.post(postHandler);

export default router.handler(controller.errorHandlers);

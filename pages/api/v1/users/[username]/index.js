import { createRouter } from "next-connect";
import controller from "infra/shared/controller.js";
import user from "models/user.js";

const router = createRouter();

async function getHandler(req, res) {
  const username = req.query.username;
  console.log("username", username);

  const existingUser = await user.findOneByUsername(username);
  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(existingUser);
}

async function patchHandler(req, res) {
  const username = req.query.username;
  const userInputValues = req.body || {};
  const updatedUser = await user.updateByUsername(username, userInputValues);

  res.status(200).json(updatedUser);
}

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

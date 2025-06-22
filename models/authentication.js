import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return {
      id: storedUser.id,
      username: storedUser.username,
      email: storedUser.email,
      createdAt: storedUser.created_at,
      updatedAt: storedUser.updated_at,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Invalid email or password",
        action: "Please check the credentials and try again",
      });
    }
    throw error;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Invalid email or password",
        action: "Please check the credentials and try again",
      });
    }
  }

  async function findUserByEmail(providedEmail) {
    try {
      return await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Invalid email or password",
          action: "Please check the credentials and try again",
        });
      }
      throw error;
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;

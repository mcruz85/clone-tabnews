import database from "infra/database.js";
import passwordModel from "models/password.js";
import { NotFoundError, ValidationError } from "infra/errors.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function create({ username, email, password }) {
  console.log("Creating user with username:", username, "and email:", email);
  if (!username || !email || !password) {
    throw new ValidationError({
      message: "Missing required fields",
      action: "Please provide username, email, and password",
    });
  }

  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    throw new ValidationError({
      message: "Invalid email format",
      action: "Please provide a valid email address",
    });
  }

  // Validate uniqueness in parallel
  // eslint-disable-next-line no-undef
  await Promise.all([
    validateUniqueEmail(normalizedEmail),
    validateUniqueUsername(normalizedUsername),
  ]);

  const insertSql = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, created_at, updated_at
  `;

  const hashPassword = await passwordModel.hash(password);
  const values = [username, email, hashPassword];
  const result = await database.query({ text: insertSql, values });

  return result.rows[0];
}

async function validateUniqueEmail(email) {
  const sql = `
    SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)
  `;
  const result = await database.query({ text: sql, values: [email] });
  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "Email already exists",
      action: "Please use a different email",
    });
  }
}

async function validateUniqueUsername(username) {
  const sql = `
    SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)
  `;
  const result = await database.query({ text: sql, values: [username] });
  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "Username already exists",
      action: "Please use a different username",
    });
  }
}

function findOneByUsername(username) {
  return findUserByUsername(username, [
    "id",
    "username",
    "email",
    "created_at",
    "updated_at",
  ]);
}

function findOneByUsernameForUpdate(username) {
  return findUserByUsername(username, [
    "id",
    "username",
    "email",
    "password",
    "created_at",
    "updated_at",
  ]);
}

async function findUserByUsername(username, fields) {
  if (!username || typeof username !== "string") {
    throw new Error("Invalid username");
  }

  const sql = `
    SELECT ${fields.join(", ")}
    FROM users
    WHERE LOWER(username) = LOWER($1)
    LIMIT 1
  `;

  const result = await database.query({ text: sql, values: [username] });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: `User '${username}' not found`,
      action: "Please check the username and try again",
      status_code: 404,
    });
  }

  return result.rows[0];
}

async function findOneByEmail(email) {
  const sql = `
    SELECT id, username, email, password, created_at, updated_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `;

  const result = await database.query({ text: sql, values: [email] });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: `Email '${email}' not found`,
      action: "Please check the username and try again",
      status_code: 404,
    });
  }

  return result.rows[0];
}

async function updateByUsername(username, userInputValues) {
  const existingUser = await findOneByUsernameForUpdate(username);

  if ("username" in userInputValues) {
    const newUsername = userInputValues.username.trim();
    if (newUsername.toLowerCase() !== existingUser.username.toLowerCase()) {
      await validateUniqueUsername(newUsername);
    }
  }

  if ("email" in userInputValues) {
    const newEmail = userInputValues.email.trim().toLowerCase();
    if (newEmail.toLowerCase() !== existingUser.email.toLowerCase()) {
      if (!isValidEmail(newEmail)) {
        throw new ValidationError({
          message: "Invalid email format",
          action: "Please provide a valid email address",
        });
      }
      await validateUniqueEmail(newEmail);
    }
  }

  if ("password" in userInputValues) {
    userInputValues.password = await passwordModel.hash(
      userInputValues.password,
    );
  }

  const userWithNewValues = {
    ...existingUser,
    ...userInputValues,
  };

  return await runUpdateQuery(userWithNewValues);

  async function runUpdateQuery(userWithNewValues) {
    const sql = `
      UPDATE users
      SET username = $1,
          email = $2,
          password = $3,
          updated_at = timezone('utc', now())
      WHERE id = $4
      RETURNING id, username, email, created_at, updated_at
    `;
    const values = [
      userWithNewValues.username,
      userWithNewValues.email,
      userWithNewValues.password,
      existingUser.id,
    ];
    const result = await database.query({ text: sql, values });
    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
  updateByUsername,
  findOneByEmail,
};

export default user;

import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/errors.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function create({ username, email, password }) {
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
  const values = [username, email, password];
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

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const sql = `
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1
    `;
    const result = await database.query({ text: sql, values: [username] });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "User not found",
        action: "Please check the username and try again",
        status_code: 404,
      });
    }

    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;

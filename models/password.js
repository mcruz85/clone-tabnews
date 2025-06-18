import bcryptjs from "bcryptjs";

const PEPPER = process.env.PASSWORD_PEPPER;

if (!PEPPER) {
  throw new Error("PASSWORD_PEPPER environment variable is not set");
}

async function hash(password) {
  const passwordWithPepper = password + PEPPER;
  return await bcryptjs.hash(passwordWithPepper, getNumberOfRounds());
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(password, hash) {
  const passwordWithPepper = password + PEPPER;
  return await bcryptjs.compare(passwordWithPepper, hash);
}

const password = {
  hash,
  compare,
};

export default password;

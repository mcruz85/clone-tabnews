const nextJs = require("next/jest");
const dontEnv = require("dotenv");
dontEnv.config({
  path: ".env.development",
});

const createJestConfig = nextJs({
  dir: ".",
});

const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
});

module.exports = jestConfig;

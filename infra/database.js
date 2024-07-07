import { Client } from "pg";

async function query(queryObject) {
  let client;

  try {
    client = await getNewClient();
    return await client.query(queryObject);
  } catch (error) {
    console.error("> [database] error", error);
    throw error;
  } finally {
    await client.end();
  }
}

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return process.env.NODE_ENV === "production" ? true : false;
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: getSSLValues(),
  });

  await client.connect();
  return client;
}

export default {
  query,
  getNewClient,
};

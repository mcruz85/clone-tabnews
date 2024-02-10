import { Client } from "pg";

async function query(queryObject) {
  console.log("> [database] queryObject", queryObject);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    return await client.query(queryObject);
  } catch (error) {
    console.error("> [database] error", error);
    throw error;
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};

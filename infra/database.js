import { Client } from "pg";

async function query(queryObject) {
  console.log("> [database] queryObject", queryObject);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  const result = await client.query(queryObject);
  await client.end();
  return result;
}

export default {
  query: query,
};

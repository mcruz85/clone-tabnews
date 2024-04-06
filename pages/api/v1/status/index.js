 import database from "infra/database.js";

async function status(req, res) {
  const updateAt = new Date().toISOString();
  const databaseVersionResult = await database.query("SHOW SERVER_VERSION;");
  const databaseMaxConnectionsResult = await database.query(
    "SHOW MAX_CONNECTIONS;"
  );
  const databaseName = process.env.POSTGRES_DB || "db_local";

  const databaseOpenedConnectionsResult = await database.query({
    text: `SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname=$1;`,
    values: [databaseName],
  });

  const postgresVersionValue = databaseVersionResult.rows[0].server_version;
  const maxConnectionsValue = parseInt(
    databaseMaxConnectionsResult.rows[0].max_connections
  );
  const openedConnectionsValue = parseInt(
    databaseOpenedConnectionsResult.rows[0].count
  );

  const databaseInfo = {
    version: postgresVersionValue,
    max_connections: maxConnectionsValue,
    opened_connections: openedConnectionsValue,
  };

  res.status(200).json({
    update_at: updateAt,
    database: databaseInfo,
  });
}

export default status;

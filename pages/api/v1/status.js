import database from "/infra/database.js";

async function status(req, res) {
  console.log("> [api/status] req.method", req.method);
  const result = await database.query("SELECT 1 + 1 as sum;");
  console.log("> [api/status] result.rows", result.rows);
  res.status(200).json({
    status: "OK",
  });
}

export default status;

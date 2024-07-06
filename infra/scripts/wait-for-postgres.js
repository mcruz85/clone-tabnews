const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host=localhost", hanldeReturn);

  function hanldeReturn(error, stdout, stderr) {
    if (error || stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }
    console.log("\n✅ postgres is ready");
  }
}

console.log("🔴 waiting for postgres");
checkPostgres();

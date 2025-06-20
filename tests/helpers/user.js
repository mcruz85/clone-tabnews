export async function createUser({ username, email, password }) {
  const response = await fetch("http://localhost:3020/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return response;
}

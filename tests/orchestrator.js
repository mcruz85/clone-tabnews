import retry from "async-retry";

async function waitForAppToStart() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      minTimeout: 2000,
      factor: 1,
      onRetry: (error, attempt) =>
        console.log(`Attempt ${attempt} failed: ${error.message}`),
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3020/api/v1/status");
      if (response.status !== 200) {
        throw new Error("App is not ready yet");
      }
    }
  }
}

const orchestrator = {
  waitForAppToStart,
};

export default orchestrator;

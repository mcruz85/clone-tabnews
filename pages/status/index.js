import useSWR from "swr";

// Custom hook to fetch data
function useStatusData() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  return {
    data,
    error,
    isLoading,
  };
}

// Fetch function
async function fetchAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// Main Status Page Component
export default function StatusPage() {
  const { data, error, isLoading } = useStatusData();

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  return (
    <div className="container">
      <h1>Status Page</h1>
      <LastUpdated data={data} isLoading={isLoading} />
      <DatabaseInfo data={data} isLoading={isLoading} />
      <StatusDetails data={data} isLoading={isLoading} />
    </div>
  );
}

// Component: Last Updated
function LastUpdated({ data, isLoading }) {
  const updateAtText = isLoading
    ? "Carregando..."
    : new Date(data.update_at).toLocaleString("pt-BR");

  return <div>Última atualização: {updateAtText}</div>;
}

// Component: Database Info
function DatabaseInfo({ data, isLoading }) {
  if (isLoading) return <div>Carregando...</div>;

  const { version, max_connections, opened_connections } = data.database || {};

  return (
    <div>
      <h2>Database</h2>
      <div>Version: {version}</div>
      <div>Max Connections: {max_connections}</div>
      <div>Opened Connections: {opened_connections}</div>
    </div>
  );
}

// Component: Status Details
function StatusDetails({ data, isLoading }) {
  const jsonText = isLoading ? "Carregando..." : JSON.stringify(data, null, 2);

  return <pre>{jsonText}</pre>;
}

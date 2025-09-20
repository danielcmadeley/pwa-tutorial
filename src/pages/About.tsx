import { useQuery } from "@tanstack/react-query";

// Mock API function to demonstrate React Query with different data
const fetchAppInfo = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    version: "1.0.0",
    buildDate: new Date().toLocaleDateString(),
    features: [
      "Progressive Web App (PWA)",
      "Offline functionality",
      "TanStack Router",
      "TanStack Query",
      "PGlite Database",
      "Service Workers",
    ],
  };
};

export function About() {
  const {
    data: appInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["appInfo"],
    queryFn: fetchAppInfo,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1>📋 About This Project</h1>

      <div style={{ marginBottom: "2rem" }}>
        {isLoading && <p>Loading app information...</p>}
        {error && <p style={{ color: "red" }}>Error loading app information</p>}

        {appInfo && (
          <div>
            <div
              style={{
                background: "#f5f5f5",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              <h3>App Information</h3>
              <p>
                <strong>Version:</strong> {appInfo.version}
              </p>
              <p>
                <strong>Build Date:</strong> {appInfo.buildDate}
              </p>
            </div>

            <h3>Features</h3>
            <ul style={{ lineHeight: "1.6" }}>
              {appInfo.features.map((feature, index) => (
                <li key={index}>✅ {feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div
        style={{
          background: "#e8f4fd",
          padding: "1.5rem",
          borderRadius: "8px",
          marginTop: "2rem",
        }}
      >
        <h3>🎯 Purpose</h3>
        <p>
          This project demonstrates the integration of TanStack Router and
          TanStack Query with a Progressive Web App (PWA). It showcases how
          modern React state management and routing libraries work seamlessly
          with PWA features like offline functionality, service workers, and
          local database storage.
        </p>

        <h3>🛠️ Tech Stack</h3>
        <ul>
          <li>
            <strong>React 19:</strong> UI framework
          </li>
          <li>
            <strong>TypeScript:</strong> Type safety
          </li>
          <li>
            <strong>Vite:</strong> Build tool
          </li>
          <li>
            <strong>TanStack Router:</strong> Client-side routing
          </li>
          <li>
            <strong>TanStack Query:</strong> Data fetching and caching
          </li>
          <li>
            <strong>PGlite:</strong> Local PostgreSQL database
          </li>
          <li>
            <strong>Vite PWA Plugin:</strong> Service worker and PWA features
          </li>
        </ul>
      </div>
    </div>
  );
}

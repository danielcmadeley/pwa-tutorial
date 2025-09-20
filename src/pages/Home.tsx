import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Mock API function to demonstrate React Query
const fetchWelcomeMessage = async (): Promise<string> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return "Welcome to the PWA Test Project with TanStack Router & Query!";
};

export function Home() {
  const [count, setCount] = useState(0);

  const {
    data: welcomeMessage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["welcome"],
    queryFn: fetchWelcomeMessage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🏠 Home Page</h1>

      <div style={{ marginBottom: "2rem" }}>
        {isLoading && <p>Loading welcome message...</p>}
        {error && <p style={{ color: "red" }}>Error loading welcome message</p>}
        {welcomeMessage && (
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {welcomeMessage}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => setCount((count) => count + 1)}
          style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
        >
          Count: {count}
        </button>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}>
        <h3>🚀 Features Implemented:</h3>
        <ul>
          <li>✅ TanStack Router for client-side routing</li>
          <li>✅ TanStack Query for data fetching and caching</li>
          <li>✅ PWA functionality with service workers</li>
          <li>✅ PGlite database integration</li>
          <li>✅ Offline-first architecture</li>
        </ul>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
          Navigate to different pages using the navigation above to test the
          router. The Todos page demonstrates database integration with React
          Query.
        </p>
      </div>
    </div>
  );
}

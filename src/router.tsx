import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  Link,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";
import PWABadge from "./PWABadge";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Todos } from "./pages/Todos";

interface CountResult {
  count: number;
}

// Root component with database setup
function RootComponent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [db, setDb] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        console.log("Initializing PGlite database...");

        // Try IndexedDB first for persistence
        let database;
        try {
          database = new PGlite({
            dataDir: "idb://pwa-todos",
            extensions: { live },
          });
          await database.waitReady;
          console.log("Using IndexedDB for persistence");
        } catch (idbError) {
          console.warn("IndexedDB failed, falling back to memory:", idbError);
          // Fallback to memory database if IndexedDB fails
          database = new PGlite({
            extensions: { live },
          });
          await database.waitReady;
          console.log("Using memory database (data won't persist)");
        }

        // Create todos table
        await database.exec(`
          CREATE TABLE IF NOT EXISTS todos (
            id SERIAL PRIMARY KEY,
            text TEXT NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Add welcome todos for first-time users
        const existingTodos = await database.query(
          "SELECT COUNT(*) as count FROM todos",
        );
        if ((existingTodos.rows[0] as CountResult).count === 0) {
          await database.query(`
            INSERT INTO todos (text, completed) VALUES
            ('Welcome! This todo demonstrates data persistence 🎉', false),
            ('Try adding your own todos', false),
            ('Refresh the page - your todos will still be here!', false)
          `);
          console.log("Added welcome todos for first-time user");
        }

        console.log("Database initialized successfully");
        setDb(database);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setDbError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setDbLoading(false);
      }
    };
    initDb();
  }, []);

  if (dbLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>🗄️ Initializing database...</div>
        <div style={{ fontSize: "0.8rem", color: "#666" }}>
          Setting up PGlite for offline storage
        </div>
      </div>
    );
  }

  if (dbError || !db) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
          color: "red",
        }}
      >
        <div>Failed to initialize database</div>
        {dbError && <div style={{ fontSize: "0.8rem" }}>{dbError}</div>}
        <div style={{ fontSize: "0.8rem", color: "#666" }}>
          Check console for more details
        </div>
      </div>
    );
  }

  return (
    <PGliteProvider db={db}>
      <div>
        <nav
          style={{
            padding: "1rem",
            borderBottom: "1px solid #ccc",
            marginBottom: "2rem",
            background: "#f8f9fa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              🚀 PWA Test
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link
                to="/"
                style={{ textDecoration: "none", color: "#007bff" }}
                activeProps={{ style: { fontWeight: "bold" } }}
              >
                Home
              </Link>
              <Link
                to="/about"
                style={{ textDecoration: "none", color: "#007bff" }}
                activeProps={{ style: { fontWeight: "bold" } }}
              >
                About
              </Link>
              <Link
                to="/todos"
                style={{ textDecoration: "none", color: "#007bff" }}
                activeProps={{ style: { fontWeight: "bold" } }}
              >
                Todos
              </Link>
            </div>
          </div>
        </nav>
        <div style={{ padding: "0 1rem", minHeight: "calc(100vh - 200px)" }}>
          <Outlet />
        </div>
        <footer
          style={{
            padding: "1rem",
            textAlign: "center",
            borderTop: "1px solid #ccc",
            marginTop: "2rem",
          }}
        >
          <PWABadge />
        </footer>
      </div>
    </PGliteProvider>
  );
}

// Create the root route
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Create individual routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});

const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/todos",
  component: Todos,
});

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, todosRoute]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

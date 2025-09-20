import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import appLogo from "/favicon.svg";
import PWABadge from "./PWABadge.tsx";
import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { TodoApp } from "./TodoApp";

import "./App.css";

interface CountResult {
  count: number;
}

function App() {
  const [count, setCount] = useState(0);
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

        // Add welcome todo for first-time users
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
        <a href="https://vite.dev" target="_blank">
          <img src={appLogo} className="logo" alt="pwa-test-project logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>PWA Test Project</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <TodoApp />

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <PWABadge />
    </PGliteProvider>
  );
}

export default App;

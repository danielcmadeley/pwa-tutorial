import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider, usePGlite } from "@electric-sql/pglite-react";

// Re-export the provider and hook
export { PGliteProvider, usePGlite };

// Initialize the database
export const createDb = async () => {
  try {
    const db = new PGlite({
      dataDir: "idb://pwa-todos", // Store in IndexedDB for persistence
      extensions: { live },
    });

    // Wait for the database to be ready
    await db.waitReady;

    // Create todos table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return db;
  } catch (error) {
    console.error("Database initialization error:", error);
    // Fallback to memory database if IndexedDB fails
    const db = new PGlite({
      extensions: { live },
    });

    await db.waitReady;

    await db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return db;
  }
};

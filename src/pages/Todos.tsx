import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePGlite } from "@electric-sql/pglite-react";
import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
}

export function Todos() {
  const db = usePGlite();
  const queryClient = useQueryClient();
  const [newTodoText, setNewTodoText] = useState("");

  // Fetch todos using React Query
  const {
    data: todos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async (): Promise<Todo[]> => {
      const result = await db.query(
        "SELECT * FROM todos ORDER BY created_at DESC",
      );
      return result.rows as Todo[];
    },
    enabled: !!db,
  });

  // Add new todo mutation
  const addTodoMutation = useMutation({
    mutationFn: async (text: string) => {
      await db.query("INSERT INTO todos (text, completed) VALUES ($1, $2)", [
        text,
        false,
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodoText("");
    },
  });

  // Toggle todo completion mutation
  const toggleTodoMutation = useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: number;
      completed: boolean;
    }) => {
      await db.query("UPDATE todos SET completed = $1 WHERE id = $2", [
        !completed,
        id,
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await db.query("DELETE FROM todos WHERE id = $1", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      addTodoMutation.mutate(newTodoText.trim());
    }
  };

  if (!db) {
    return <div>Database not available</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>📝 Todos</h1>

      <p style={{ color: "#666", marginBottom: "2rem" }}>
        This page demonstrates TanStack Query integration with PGlite database.
        All mutations are cached and optimistically updated.
      </p>

      {/* Add new todo form */}
      <form onSubmit={handleAddTodo} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Enter a new todo..."
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            disabled={addTodoMutation.isPending}
          />
          <button
            type="submit"
            disabled={addTodoMutation.isPending || !newTodoText.trim()}
            style={{
              padding: "0.5rem 1rem",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {addTodoMutation.isPending ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      {/* Loading and error states */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading todos...
        </div>
      )}

      {error && (
        <div
          style={{
            color: "red",
            padding: "1rem",
            background: "#ffe6e6",
            borderRadius: "4px",
          }}
        >
          Error loading todos: {error.message}
        </div>
      )}

      {/* Todos list */}
      {todos.length === 0 && !isLoading && !error && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          No todos yet. Add one above!
        </div>
      )}

      {todos.length > 0 && (
        <div>
          <div
            style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}
          >
            {todos.filter((todo) => !todo.completed).length} active,{" "}
            {todos.filter((todo) => todo.completed).length} completed
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {todos.map((todo) => (
              <div
                key={todo.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  background: todo.completed ? "#f8f9fa" : "white",
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() =>
                    toggleTodoMutation.mutate({
                      id: todo.id,
                      completed: todo.completed,
                    })
                  }
                  disabled={toggleTodoMutation.isPending}
                />
                <span
                  style={{
                    flex: 1,
                    textDecoration: todo.completed ? "line-through" : "none",
                    color: todo.completed ? "#6c757d" : "inherit",
                  }}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodoMutation.mutate(todo.id)}
                  disabled={deleteTodoMutation.isPending}
                  style={{
                    padding: "0.25rem 0.5rem",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query status indicator */}
      <div style={{ marginTop: "2rem", fontSize: "0.8rem", color: "#666" }}>
        <strong>React Query Status:</strong>
        {isLoading && " Loading..."}
        {addTodoMutation.isPending && " Adding todo..."}
        {toggleTodoMutation.isPending && " Updating todo..."}
        {deleteTodoMutation.isPending && " Deleting todo..."}
        {!isLoading &&
          !addTodoMutation.isPending &&
          !toggleTodoMutation.isPending &&
          !deleteTodoMutation.isPending &&
          " Idle"}
      </div>
    </div>
  );
}

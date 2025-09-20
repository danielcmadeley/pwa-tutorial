import React, { useState } from "react";
import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react";
import "./TodoApp.css";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
}

export const TodoApp: React.FC = () => {
  const db = usePGlite();
  const [newTodoText, setNewTodoText] = useState("");

  // Use live query to get todos - will automatically re-render when data changes
  const todosResult = useLiveQuery<Todo>(
    `
    SELECT id, text, completed, created_at
    FROM todos
    ORDER BY created_at DESC
  `,
    [],
  );

  const todos = todosResult?.rows || [];

  const addTodo = async () => {
    if (newTodoText.trim()) {
      try {
        await db.query("INSERT INTO todos (text) VALUES ($1)", [
          newTodoText.trim(),
        ]);
        setNewTodoText("");
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      await db.query("UPDATE todos SET completed = $1 WHERE id = $2", [
        !completed,
        id,
      ]);
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await db.query("DELETE FROM todos WHERE id = $1", [id]);
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const clearCompleted = async () => {
    try {
      await db.query("DELETE FROM todos WHERE completed = TRUE");
    } catch (error) {
      console.error("Error clearing completed todos:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo();
  };

  const completedCount = todos.filter((todo) => todo.completed).length || 0;
  const totalCount = todos.length || 0;

  return (
    <div className="todo-app">
      <h2>📝 Offline Todos</h2>
      <p className="subtitle">Powered by PGlite - works offline!</p>

      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="What needs to be done?"
          className="todo-input"
        />
        <button type="submit" disabled={!newTodoText.trim()}>
          Add Todo
        </button>
      </form>

      {todos.length > 0 && (
        <div className="todo-stats">
          <span>{totalCount - completedCount} remaining</span>
          <span>{completedCount} completed</span>
          {completedCount > 0 && (
            <button onClick={clearCompleted} className="clear-completed">
              Clear completed
            </button>
          )}
        </div>
      )}

      <div className="todo-list">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id, todo.completed)}
              className="todo-checkbox"
            />
            <span className="todo-text">{todo.text}</span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="delete-btn"
              title="Delete todo"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <div className="empty-state">
          <p>No todos yet. Add one above! 👆</p>
        </div>
      )}

      <div className="offline-indicator">
        <span className="status-dot"></span>
        Data stored locally - works offline!
        <br />
        <small style={{ opacity: 0.8 }}>
          {todos.length > 0
            ? "✅ Data persists across page refreshes"
            : "ℹ️ Add todos to test persistence"}
        </small>
      </div>
    </div>
  );
};

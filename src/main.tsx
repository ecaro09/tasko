import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Ensure document is available before calling getElementById
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found in the document.");
}
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { initializeFirebaseClient } from "./lib/firebase.ts"; // Import the initialization function

// Initialize Firebase services
try {
  initializeFirebaseClient();
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  // You might want to render an error page or a fallback UI here
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found in the document.");
}
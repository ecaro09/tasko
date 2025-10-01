import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
// import './performance-optimizer'; // Removed the import for performance optimizer

createRoot(document.getElementById("root")!).render(<App />);
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import './performance-optimizer'; // Import the performance optimizer

createRoot(document.getElementById("root")!).render(<App />);
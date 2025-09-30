import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { FirebaseProvider } from "./components/FirebaseProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <FirebaseProvider>
    <App />
  </FirebaseProvider>
);
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AmplifyClientProvider } from "./providers/AmplifyClientProvider.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AmplifyClientProvider />
    <App />
  </StrictMode>
);

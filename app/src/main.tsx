import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.tsx";
import { AmplifyClientProvider } from "./providers/AmplifyClientProvider.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AmplifyClientProvider />
    <App />
    <Toaster 
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: '#374151',
          color: '#f9fafb',
          border: '1px solid #4b5563',
        },
      }}
    />
  </StrictMode>
);

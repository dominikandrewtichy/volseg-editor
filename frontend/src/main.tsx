import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { App } from "./App.tsx";
import { MolstarProvider } from "./contexts/MolstarProvider.tsx";
import { ThemeProvider } from "./contexts/ThemeProvider.tsx";
import { AuthProvider } from "./contexts/AuthProvider.tsx";
import { client } from "./lib/client/client.gen.ts";
import { BrowserRouter } from "react-router";

import "./index.css";

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

// client.interceptors.response.use((response, request) => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <MolstarProvider>
            <App />
          </MolstarProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);

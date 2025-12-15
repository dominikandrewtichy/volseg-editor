import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import { App } from "./App.tsx";
import { client } from "./lib/client/client.gen.ts";

import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { AuthProvider } from "./context/auth-provider.tsx";
import { ThemeProvider } from "./context/theme-provider.tsx";
import "./index.css";

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider delayDuration={1500}>
            <Toaster />
            <App />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { App } from "./App.tsx";
import { ThemeProvider } from "./features/theme/ThemeProvider.tsx";
import { client } from "./lib/client/client.gen.ts";
import { BrowserRouter } from "react-router";

import "./index.css";
import { AuthProvider } from "./features/auth/AuthProvider.tsx";

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

// async function myInterceptor(response: Response) {
//   if (response.status === 401) {
//     window.location.href = "/login";
//   }
//   return response;
// }
// client.interceptors.response.use(myInterceptor);

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
    <Toaster />
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark">
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);

import { Route, Routes } from "react-router";
import { MolstarProvider } from "./context/molstar-provider";
import { Layout } from "./layout/Layout";
import { ProtectedRoute } from "./layout/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { EntryPage } from "./pages/EntryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SharedEntryPage } from "./pages/SharePage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/share/:shareLinkId"
          element={
            <MolstarProvider>
              <SharedEntryPage />
            </MolstarProvider>
          }
        />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/entries/:entryId"
            element={
              <MolstarProvider>
                <EntryPage />
              </MolstarProvider>
            }
          />
        </Route>

        {/* Not exists */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

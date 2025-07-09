import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { EntryCreatePage } from "./pages/CreateEntryPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EntryDetailsPage } from "./pages/EntryDetailsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import UploadVolseg from "./pages/UploadVolsegPage";
import { VolsegEntryPreviewPage } from "./pages/VolsegEntryPreviewPage";
import { MolstarProvider } from "./contexts/MolstarProvider";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/entries/:entryId"
          element={
            <MolstarProvider>
              <EntryDetailsPage />
            </MolstarProvider>
          }
        />
        <Route
          path="/volseg-entries/:entryId"
          element={
            <MolstarProvider>
              <VolsegEntryPreviewPage />
            </MolstarProvider>
          }
        />

        <Route element={<ProtectedRoute />}>
          {/* <Route path="/share/:share_link_id" element={<ShareEntryPage />} /> */}
          <Route path="/entries/new" element={<EntryCreatePage />} />
          <Route
            path="/upload"
            element={
              <MolstarProvider>
                <UploadVolseg />
              </MolstarProvider>
            }
          />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

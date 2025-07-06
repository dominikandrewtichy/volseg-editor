import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { EntryCreatePage } from "./pages/CreateEntryPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EntryDetailsPage } from "./pages/EntryDetailsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import ShareEntryPage from "./pages/ShareEntryPage";
import UploadVolseg from "./pages/UploadVolseg";
import { VolsegEntryPreview } from "./pages/VolsegEntryPreview";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/entries/:entryId" element={<EntryDetailsPage />} />
          <Route
            path="/volseg-entries/:entryId"
            element={<VolsegEntryPreview />}
          />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/share/:share_link_id"
            element={
              <ProtectedRoute>
                <ShareEntryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entries/new"
            element={
              <ProtectedRoute>
                <EntryCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadVolseg />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

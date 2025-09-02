import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { Layout } from "./layout/Layout";
import { EntryCreatePage } from "./features/entries/pages/CreateEntryPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import UploadVolseg from "./features/volseg-entries/components/UploadVolsegPage";
import { VolsegEntryPreviewPage } from "./features/volseg-entries/components/VolsegEntryPreviewPage";
import { MolstarProvider } from "./features/molstar/MolstarProvider";
import { EntryDetailsPage } from "./features/entries/pages/EntryDetailsPage";
import { Editor } from "./features/content/components/Tiptap";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
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
        <Route
          path="/test"
          element={
            <MolstarProvider>
              <Editor isEditing={true} />
            </MolstarProvider>
          }
        />

        {/* Private routes */}
        <Route element={<ProtectedRoute />}>
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

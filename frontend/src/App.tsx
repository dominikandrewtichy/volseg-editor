import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { EntryCreatePage } from "./pages/CreateEntryPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EntryDetailsPage } from "./pages/EntryDetailsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import UploadVolseg from "./pages/UploadVolseg";
import { VolsegEntryPreview } from "./pages/VolsegEntryPreview";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/entries/:entryId" element={<EntryDetailsPage />} />
        <Route
          path="/volseg-entries/:entryId"
          element={<VolsegEntryPreview />}
        />

        <Route element={<ProtectedRoute />}>
          {/* <Route path="/share/:share_link_id" element={<ShareEntryPage />} /> */}
          <Route path="/entries/new" element={<EntryCreatePage />} />
          <Route path="/upload" element={<UploadVolseg />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

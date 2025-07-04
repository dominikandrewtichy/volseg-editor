import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { MainLayout } from "./components/layout/Layout";
import { LandingPage } from "./pages/LandingPage";
import { EntryCreatePage } from "./pages/CreateEntryPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { EntryDetailsPage } from "./pages/EntryDetailsPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import UploadVolseg from "./pages/UploadVolseg";
import { VolsegEntryPreview } from "./pages/VolsegEntryPreview";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ShareEntryPage from "./pages/ShareEntryPage";

export function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
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

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </>
  );
}

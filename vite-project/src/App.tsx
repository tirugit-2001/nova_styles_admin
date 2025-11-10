import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRouter";
import { AdminLayout } from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import { HeroSectionAdmin } from "./pages/AdminComponents/HeroSectionAdmin";
import { InteriorScrollAdmin } from "./pages/AdminComponents/InteriorScrollAdmin";
import { ProductAdmin } from "./pages/e-commorce/ProductAdmin";
import { PortfolioAdmin } from "./pages/AdminComponents/PortfolioAdmin";
import { LoginPage } from "./login/login";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/hero"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <HeroSectionAdmin />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/interiorscroll"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <InteriorScrollAdmin />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/portfolioadmin"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PortfolioAdmin />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ProductAdmin />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

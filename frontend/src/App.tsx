import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PartsPage from "./pages/PartsPage";
import OrderPage from "./pages/OrderPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import ViewOrderPage from "./pages/ViewOrderPage";
import ManageOrderPage from "./pages/ManageOrderPage";
import ViewPartPage from "./pages/ViewPartPage";
import StoragePage from "./pages/StoragePage";
import MachinePage from "./pages/MachinePage";
import ProjectsPage from "./pages/ProjectsPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import PrivateRoute from "./components/customui/routing/PrivateRouting";
import InvoicePage from "./pages/InvoicePage";
import ManagementPage from "./pages/ManagementPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NoProfilePage from "./pages/NoProfilePage";
import DisabledPage from "./pages/DisabledPage";
import BusinessLens from "./pages/BusinessLensPage";
import BusinessLensWizard from "./pages/BusinessLensWizardPage";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes (pageKey maps to access_control.target) */}
          <Route
            path="/"
            element={
              <PrivateRoute pageKey="home">
                <HomePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/parts"
            element={
              <PrivateRoute pageKey="parts">
                <PartsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/viewpart/:id"
            element={
              <PrivateRoute pageKey="view part">
                <ViewPartPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/invoice/:id"
            element={
              <PrivateRoute pageKey="invoice">
                <InvoicePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <PrivateRoute pageKey="orders">
                <OrderPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/management"
            element={
              <PrivateRoute pageKey="management">
                <ManagementPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/createorder"
            element={
              <PrivateRoute pageKey="create order">
                <CreateOrderPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/vieworder/:id"
            element={
              <PrivateRoute pageKey="view order">
                <ViewOrderPage />
              </PrivateRoute>
            }
          />

          {/* You can later add an async canAccess here to enforce status-based access too */}
          <Route
            path="/manageorder/:id"
            element={
              <PrivateRoute pageKey="manage order">
                <ManageOrderPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/storage"
            element={
              <PrivateRoute pageKey="storage">
                <StoragePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/machine"
            element={
              <PrivateRoute pageKey="machine">
                <MachinePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/project"
            element={
              <PrivateRoute pageKey="project">
                <ProjectsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/businessLens"
            element={
              <PrivateRoute pageKey="businesslens">
                <BusinessLens />
              </PrivateRoute>
            }
          />

          <Route
            path="/businessLens/:templateId"
            element={
              <PrivateRoute pageKey="businesslens reports">
                <BusinessLensWizard />
              </PrivateRoute>
            }
          />

          {/* Public/system pages */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/profileNotFound" element={<NoProfilePage />} />
          <Route path="/PageDisabled" element={<DisabledPage />} />
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

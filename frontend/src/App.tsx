import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PartsPage from './pages/PartsPage';
import EditPartPage from './pages/EditPartPage';
import OrderPage from './pages/OrderPage';
import CreateOrderPage from './pages/CreateOrderPage';
import ViewOrderPage from './pages/ViewOrderPage';
import ManageOrderPage from './pages/ManageOrderPage';
import ViewPartPage from './pages/ViewPartPage';
import AddPartPage from './pages/AddPartPage';
import StoragePage from './pages/StoragePage';
import MachinePage from './pages/MachinePage';
import ProjectsPage from './pages/ProjectsPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/customui/routing/PrivateRouting'; // Import PrivateRoute component
import InvoicePage from './pages/InvoicePage';
import ManagementPage from './pages/ManagementPage';
import ExpenseLensPage from './pages/ExpenseLensPart';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NoProfilePage from './pages/NoProfilePage';
import DisabledPage from './pages/DisabledPage';
import BusinessLens from './pages/BusinessLensPage';
import BusinessLensWizard from './pages/BusinessLensWizardPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/parts"
            element={
              <PrivateRoute>
                <PartsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/addpart"
            element={
              <PrivateRoute>
                <AddPartPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/editpart/:id"
            element={
              <PrivateRoute>
                <EditPartPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenselens/:id"
            element={
              <PrivateRoute>
                <ExpenseLensPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/viewpart/:id"
            element={
              <PrivateRoute>
                <ViewPartPage />
              </PrivateRoute>
            }
          />
          <Route  
            path="/invoice/:id"
            element={
              <PrivateRoute>
                <InvoicePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrderPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/management"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <ManagementPage/>
              </PrivateRoute>
            }
          />
          <Route
            path="/createorder"
            element={
              <PrivateRoute>
                <CreateOrderPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/vieworder/:id"
            element={
              <PrivateRoute>
                <ViewOrderPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/manageorder/:id"
            element={
              <PrivateRoute>
                <ManageOrderPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/storage"
            element={
              <PrivateRoute>
                <StoragePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/machine"
            element={
              <PrivateRoute>
                <MachinePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/project"
            element={
              // <PrivateRoute allowedRoles={['admin']}>
              <ProjectsPage />
              // </PrivateRoute>
            }
          />
          <Route
            path="/businessLens"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <BusinessLens />
              </PrivateRoute>
            }
          />
          <Route
            path="/businessLens/:templateId"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <BusinessLensWizard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route 
            path="/unauthorized" 
            element={<UnauthorizedPage />} 
          />
          <Route 
            path="/profileNotFound" 
            element={<NoProfilePage />} 
          />
          <Route 
            path="/PageDisabled" 
            element={<DisabledPage />} 
          />
        </Routes>  
      </Router>
    </AuthProvider>
  );
};

export default App;

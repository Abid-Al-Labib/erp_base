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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/parts" element={<PartsPage />} />
        <Route path="/addpart" element={<AddPartPage />} />
        <Route path="/editpart/:id" element={<EditPartPage />} />
        <Route path="/viewpart/:id" element={<ViewPartPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/createorder" element={<CreateOrderPage />} />
        <Route path="/vieworder/:id" element={<ViewOrderPage />} />
        <Route path="/manageorder/:id" element={<ManageOrderPage />} />

      </Routes>
    </Router>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PartsPage from './pages/PartsPage';
import AddPart from './pages/AddPart';
import EditPart from './pages/EditPart';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/parts" element={<PartsPage />} />
        <Route path="/addpart" element={<AddPart />} />
        <Route path="/editpart/:id" element={<EditPart />} />
      </Routes>
    </Router>
  );
};

export default App;

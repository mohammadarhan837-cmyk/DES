import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ProjectDetail from './pages/ProjectDetail';
import EscrowPayment from './pages/EscrowPayment';
import Dispute from './pages/Dispute';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import BrowseProjects from './pages/BrowseProjects';
import NotFound from './pages/NotFound';

// CSS
import './App.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>

        {/* ── PUBLIC ROUTES ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── PROTECTED ROUTES ── */}
        <Route path="/client-dashboard" element={
          <ProtectedRoute><ClientDashboard /></ProtectedRoute>
        } />
        <Route path="/freelancer-dashboard" element={
          <ProtectedRoute><FreelancerDashboard /></ProtectedRoute>
        } />
        <Route path="/project/:id" element={
          <ProtectedRoute><ProjectDetail /></ProtectedRoute>
        } />
        <Route path="/escrow-payment" element={
          <ProtectedRoute><EscrowPayment /></ProtectedRoute>
        } />
        <Route path="/dispute" element={
          <ProtectedRoute><Dispute /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><Notifications /></ProtectedRoute>
        } />
        <Route path="/browse-projects" element={
          <ProtectedRoute><BrowseProjects /></ProtectedRoute>
        } />

        {/* ── 404 PAGE ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
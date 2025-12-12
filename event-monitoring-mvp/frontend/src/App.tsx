import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Component imports
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Cameras from './pages/Cameras';
import LiveView from './pages/LiveView';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Redux store types
import { RootState } from './store/store';

/**
 * Main Application Component
 * 
 * This is the root component that handles authentication-based routing.
 * If the user is not authenticated, it shows the Login page.
 * If authenticated, it renders the main application layout with all routes.
 * 
 * Features:
 * - Authentication guard (redirects to login if not authenticated)
 * - Route configuration for all application pages
 * - Layout wrapper for authenticated pages
 * - Fallback route for unknown paths
 * 
 * @returns JSX.Element - Either Login page or main app with routing
 */
const App: React.FC = () => {
  // Get authentication state from Redux store
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // If user is not authenticated, show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  // Render main application with authenticated layout and routing
  return (
    <Layout>
      <Routes>
        {/* Main dashboard route */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Camera and monitoring routes */}
        <Route path="/live-view" element={<LiveView />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/events" element={<Events />} />
        <Route path="/cameras" element={<Cameras />} />
        
        {/* User management routes */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Catch-all route - redirects unknown paths to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
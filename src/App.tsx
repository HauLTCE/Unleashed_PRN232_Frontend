import React from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom'; // No <Route> import needed here
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './hooks/User/useAuth';
import { Toaster } from './components/ui/sonner';

// Import the route elements
import AdminRoutes from './routes/AdminRoutes';
import CustomerRoutes from './routes/CustomerRoutes';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {AdminRoutes}
            {CustomerRoutes}
          </Routes>

          <Toaster position="top-right" />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
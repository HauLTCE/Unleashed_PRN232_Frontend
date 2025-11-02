import { BrowserRouter as Router, Routes } from 'react-router-dom'; // No <Route> import needed here
import { Toaster } from './components/ui/sonner';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './hooks/User/useAuth';

// Import the route elements
import { CartProvider } from './hooks/useCart';
import AdminRoutes from './routes/AdminRoutes';
import CustomerRoutes from './routes/CustomerRoutes';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          <Router>
            <Routes>
              {AdminRoutes}
              {CustomerRoutes}
            </Routes>

            <Toaster position="top-right" />
          </Router>
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  );
}
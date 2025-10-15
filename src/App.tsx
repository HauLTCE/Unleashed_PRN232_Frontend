import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Homepage } from './pages/Homepage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { Toaster } from './components/ui/sonner';

// Import other pages as they're created
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { CheckoutFailedPage } from './pages/CheckoutFailedPage';
import { CheckoutPendingPage } from './pages/CheckoutPendingPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { ForbiddenPage } from './pages/ForbiddenPage';

// Import admin pages
import { DashboardPage } from './admin/pages/DashboardPage';
import { ProductsPage } from './admin/pages/ProductsPage';
import { OrdersPage } from './admin/pages/OrdersPage';
import { CustomersPage } from './admin/pages/CustomersPage';
import { SuppliersPage } from './admin/pages/SuppliersPage';
import { AnalyticsPage } from './admin/pages/AnalyticsPage';
import { StockPage } from './admin/pages/StockPage';
import { DiscountsPage } from './admin/pages/DiscountsPage';
import { NotificationsPage } from './admin/pages/NotificationsPage';
import { SettingsPage } from './admin/pages/SettingsPage';
import { ProductDetailPage as AdminProductDetailPage } from './admin/pages/ProductDetailPage';
import { OrderDetailPage } from './admin/pages/OrderDetailPage';
import { AuthProvider } from './hooks/User/useAuth';
import { CustomerDetailPage } from './admin/pages/CustomerDetailPage';
import { CreateEmployeePage } from './admin/pages/CreateEmployeePage';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Admin Routes - without Header/Footer */}
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/users" element={<CustomersPage />} />
            <Route path="/admin/suppliers" element={<SuppliersPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/stock" element={<StockPage />} />
            <Route path="/admin/discounts" element={<DiscountsPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/products/:id" element={<AdminProductDetailPage />} />
            <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
            <Route path="/admin/users/:userId" element={<CustomerDetailPage />} />
            <Route path="/admin/users/create" element={<CreateEmployeePage />} />

            {/* Customer-facing routes with Header/Footer */}
            <Route path="/*" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                    <Route path="/checkout/failed" element={<CheckoutFailedPage />} />
                    <Route path="/checkout/pending" element={<CheckoutPendingPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/403" element={<ForbiddenPage />} />
                    <Route path="/500" element={<ServerErrorPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
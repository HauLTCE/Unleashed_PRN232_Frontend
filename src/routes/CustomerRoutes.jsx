import { Outlet, Route } from 'react-router-dom';

import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

// Pages
import { AboutPage } from '../pages/AboutPage';
import { AccountPage } from '../pages/AccountPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutFailedPage } from '../pages/CheckoutFailedPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutPendingPage } from '../pages/CheckoutPendingPage';
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage';
import { ConfirmEmailPage } from '../pages/ConfirmEmailPage';
import { ContactPage } from '../pages/ContactPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { Homepage } from '../pages/Homepage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { ServerErrorPage } from '../pages/ServerErrorPage';
import { ShopPage } from '../pages/ShopPage';
import { SignupPage } from '../pages/SignupPage';
import { WishlistPage } from '../pages/WishlistPage';

import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProtectedRoute } from './ProtectedRoute';
import CustomterOrderDetailPage from '../pages/CustomterOrderDetailPage';

const CustomerLayout = () => (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
            <Outlet />
        </main>
        <Footer />
    </div>
);

const CustomerRoutes = (
    <Route element={<CustomerLayout />}>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Semi-public */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* Protected routes */}
        <Route
            path="/account"
            element={
                <ProtectedRoute>
                    <AccountPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/checkout"
            element={
                <ProtectedRoute>
                    <CheckoutPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/checkout/success"
            element={
                <ProtectedRoute>
                    <CheckoutSuccessPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/checkout/failed"
            element={
                <ProtectedRoute>
                    <CheckoutFailedPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/checkout/pending"
            element={
                <ProtectedRoute>
                    <CheckoutPendingPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/order/:orderId"
            element={
                <ProtectedRoute>
                    <CustomterOrderDetailPage />
                </ProtectedRoute>
            }
        />
        {/* Error pages */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
    </Route>
);

export default CustomerRoutes;
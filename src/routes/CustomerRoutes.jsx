import React from 'react';
import { Route, Outlet } from 'react-router-dom';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

// Pages
import { Homepage } from '../pages/Homepage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ConfirmEmailPage } from '../pages/ConfirmEmailPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { ShopPage } from '../pages/ShopPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage';
import { CheckoutFailedPage } from '../pages/CheckoutFailedPage';
import { CheckoutPendingPage } from '../pages/CheckoutPendingPage';
import { AccountPage } from '../pages/AccountPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ServerErrorPage } from '../pages/ServerErrorPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';

import { ProtectedRoute } from './ProtectedRoute';

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

        {/* Error pages */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
    </Route>
);

export default CustomerRoutes;

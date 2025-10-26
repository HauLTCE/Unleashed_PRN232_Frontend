import React from 'react';
import { Route, Outlet } from 'react-router-dom';

// Import layout components
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

// Import all customer-facing pages
import { Homepage } from '../pages/Homepage';
import { LoginPage } from '../pages/LoginPage';
// ... (all your other page imports)
import { SignupPage } from '../pages/SignupPage';
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
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { ConfirmEmailPage } from '../pages/ConfirmEmailPage';

/**
 * Layout component for customer routes.
 * This remains a standard component.
 */
const CustomerLayout = () => (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
            <Outlet />
        </main>
        <Footer />
    </div>
);

/**
 * This is now a JSX element (a <Route> element), not a component.
 * It's a valid child for the <Routes> component.
 */
const CustomerRoutes = (
    <Route element={<CustomerLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
    </Route>
);

export default CustomerRoutes;
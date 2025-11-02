import { Outlet, Route } from 'react-router-dom';

// Import layout components
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

// Import all customer-facing pages
import { Homepage } from '../pages/Homepage';
import { LoginPage } from '../pages/LoginPage';
// ... (all your other page imports)
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ShopPage } from '../pages/ShopPage';
import { SignupPage } from '../pages/SignupPage';

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
import { NotFoundPage } from '../pages/NotFoundPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { ServerErrorPage } from '../pages/ServerErrorPage';
import { WishlistPage } from '../pages/WishlistPage';

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
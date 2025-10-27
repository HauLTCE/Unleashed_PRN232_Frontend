import React from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/User/useAuth';

// Import all admin pages
import { DashboardPage } from '../admin/pages/DashboardPage';
import { ProductsPage } from '../admin/pages/ProductsPage';
import { OrdersPage } from '../admin/pages/OrdersPage';
import { CustomersPage } from '../admin/pages/CustomersPage';
import { SuppliersPage } from '../admin/pages/SuppliersPage';
import { AnalyticsPage } from '../admin/pages/AnalyticsPage';
import { StockPage } from '../admin/pages/StockPage';
import { DiscountsPage } from '../admin/pages/DiscountsPage';
import { NotificationsPage } from '../admin/pages/NotificationsPage';
import { SettingsPage } from '../admin/pages/SettingsPage';
import { ProductDetailPage as AdminProductDetailPage } from '../admin/pages/ProductDetailPage';
import { OrderDetailPage } from '../admin/pages/OrderDetailPage';
import { CustomerDetailPage } from '../admin/pages/CustomerDetailPage';
import { CreateEmployeePage } from '../admin/pages/CreateEmployeePage';
import { NotificationDetailPage } from '../admin/pages/NotificationDetailPage';
import { CreateNotificationPage } from '../admin/pages/CreateNotificationPage';

const AdminLayout = () => {

    const { isLoading, isAuthenticated, role } = useAuth();

    if (isLoading) {
        return <div>Loading authentication...</div>;
    }

    const isAuthorized = isAuthenticated && (role === 'ADMIN' || role === 'STAFF');

    if (!isAuthorized) {
        return <Navigate to="/404" replace />;
    }
    return <Outlet />;
};


const AdminRoutes = (
    <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<AdminProductDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="users" element={<CustomersPage />} />
        <Route path="users/create" element={<CreateEmployeePage />} />
        <Route path="users/:userId" element={<CustomerDetailPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="notifications/create" element={<CreateNotificationPage />} />
        <Route path="notifications/:notificationId" element={<NotificationDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
    </Route>
);

export default AdminRoutes;
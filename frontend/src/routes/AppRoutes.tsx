import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import HomePage from "../pages/public/HomePage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLayout from "../components/layout/AdminLayout";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminSellersPage from "../pages/admin/AdminSellersPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ProductDetailPage from "../pages/product/ProductDetailPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import CartPage from "../pages/cart/CartPage";
import ProtectedRoute from "./ProtectedRoute";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import CustomerLayout from "../components/layout/CustomerLayout";
import CustomerOrdersPage from "../pages/customer/CustomerOrdersPage";
import CustomerFinancingPage from "../pages/customer/CustomerFinancingPage";
import CustomerWalletPage from "../pages/customer/CustomerWalletPage";
import CustomerNotificationsPage from "../pages/customer/CustomerNotificationsPage";
import MarketplacePage from "../pages/marketplace/MarketplacePage";
import SellerLayout from "../components/layout/SellerLayout";
import SellerDashboardHome from "../pages/seller/SellerDashboard";
import SellerProductsPage from "../pages/seller/SellerProductsPage";
import SellerSalesPage from "../pages/seller/SellerSalesPage";
import SellerWalletPage from "../pages/seller/SellerWalletPage";
import SellerNotificationsPage from "../pages/seller/SellerNotification";
import SellerShipmentsPage from "../pages/seller/SellerShipmentsPage";
import AdminFinancingsPage from "../pages/admin/AdminFinancingsPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import VerifyOTPPage from "../pages/auth/VerifyOTPPage";
import CustomerShipmentsPage from "../pages/customer/CustomerShipments";
import ChatPage from "../pages/chat/ChatPage";
import AdminChatAuditPage from "../pages/admin/AdminChatPage";
import AdminDeliveryProofsPage from "../pages/admin/AdminDeliveryProofsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="sellers" element={<AdminSellersPage />} />
          <Route path="financings" element={<AdminFinancingsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="/admin/chats" element={<AdminChatAuditPage />} />
          <Route
            path="/admin/delivery-proofs"
            element={<AdminDeliveryProofsPage />}
          />
        </Route>
        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRoles={["SELLER", "ADMIN"]}>
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SellerDashboardHome />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="sales" element={<SellerSalesPage />} />
          <Route path="wallet" element={<SellerWalletPage />} />
          <Route path="shipments" element={<SellerShipmentsPage />} />
          <Route path="notifications" element={<SellerNotificationsPage />} />
        </Route>

        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerDashboard />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="orders" element={<CustomerOrdersPage />} />
          <Route path="financing" element={<CustomerFinancingPage />} />
          <Route path="wallet" element={<CustomerWalletPage />} />
          <Route path="notifications" element={<CustomerNotificationsPage />} />
          <Route
            path="/customer/shipments"
            element={<CustomerShipmentsPage />}
          />
        </Route>

        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

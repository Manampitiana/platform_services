import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import GuestRoute from './routes/GuestRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import Home from './pages/public/Home'
import Services from './pages/public/Services'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifiedRoute from './routes/VerifiedRoute'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import Dashboard from './pages/client/Dashboard'
import ClientLayout from './layouts/ClientLayout'
import ServiceDetail from './pages/public/ServiceDetail'
import NewOrder from './pages/client/NewOrder'
import Orders from './pages/client/Orders'
import OrderDetail from './pages/client/OrderDetail'
import Profile from './pages/client/Profile'

import AdminRoute from './routes/AdminRoute'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminPayments from './pages/admin/AdminPayments'
import AdminServices from './pages/admin/AdminServices'
import AdminServiceEdit from './pages/admin/AdminServiceEdit'
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />

      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={<VerifiedRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/orders/new" element={<NewOrder />} />
          </Route>

          <Route element={<ClientLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:uuid" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>


          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<Profile />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:uuid" element={<AdminOrderDetail />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/services/new" element={<AdminServiceEdit />} />
              <Route path="/admin/services/:id" element={<AdminServiceEdit />} />
              <Route path="/admin/payment-methods" element={<AdminPaymentMethods />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
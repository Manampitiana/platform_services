import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Loader from './components/common/Loader'
import PublicLayout from './layouts/PublicLayout'
import AdminRoute from './routes/AdminRoute'
import ClientRoute from './routes/ClientRoute'
import GuestRoute from './routes/GuestRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import VerifiedRoute from './routes/VerifiedRoute'
import Home from './pages/public/Home'

// Layouts
const ClientLayout = lazy(() => import('./layouts/ClientLayout'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))

// Public
const Services = lazy(() => import('./pages/public/Services'))
const ServiceDetail = lazy(() => import('./pages/public/ServiceDetail'))
const Faq = lazy(() => import('./pages/public/Faq'))
const About = lazy(() => import('./pages/public/About'))
const Contact = lazy(() => import('./pages/public/Contact'))
const Terms = lazy(() => import('./pages/public/legal/Terms'))
const Privacy = lazy(() => import('./pages/public/legal/Privacy'))
const Refunds = lazy(() => import('./pages/public/legal/Refunds'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Auth
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))

// Client
const Dashboard = lazy(() => import('./pages/client/Dashboard'))
const NewOrder = lazy(() => import('./pages/client/NewOrder'))
const Orders = lazy(() => import('./pages/client/Orders'))
const OrderDetail = lazy(() => import('./pages/client/OrderDetail'))
const Profile = lazy(() => import('./pages/client/Profile'))

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'))
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'))
const AdminServices = lazy(() => import('./pages/admin/AdminServices'))
const AdminServiceEdit = lazy(() => import('./pages/admin/AdminServiceEdit'))
const AdminPaymentMethods = lazy(() => import('./pages/admin/AdminPaymentMethods'))
const AdminContactMessages = lazy(() => import('./pages/admin/AdminContactMessages'))

export default function App() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="*" element={<NotFound />} />
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
            <Route element={<ClientRoute />}>
              <Route element={<PublicLayout />}>
                <Route path="/orders/new" element={<NewOrder />} />
              </Route>

              <Route element={<ClientLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:uuid" element={<OrderDetail />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/orders/:uuid" element={<AdminOrderDetail />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/services/new" element={<AdminServiceEdit />} />
                <Route path="/admin/services/:id" element={<AdminServiceEdit />} />
                <Route path="/admin/payment-methods" element={<AdminPaymentMethods />} />
                <Route path="/admin/contact" element={<AdminContactMessages />} />
                <Route path="/admin/profile" element={<Profile />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdminCompanies from './pages/AdminCompanies';
import AdminUsers from './pages/AdminUsers';
import Dashboard from './pages/Dashboard';
import People from './pages/People';
import PersonForm from './pages/PersonForm';
import Departments from './pages/Departments';
import PPECatalog from './pages/PPECatalog';
import Stock from './pages/Stock';
import Issuing from './pages/Issuing';
import Reminders from './pages/Reminders';
import SizeRequests from './pages/SizeRequests';
import Signatures from './pages/Signatures';
import Reports from './pages/Reports';
import IssuedPPE from './pages/IssuedPPE';
import SignPublic from './pages/SignPublic';
import SizesPublic from './pages/SizesPublic';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.is_super_admin) return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_super_admin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      >
        <Route index element={<AdminCompanies />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
      <Route path="/sign/:token" element={<SignPublic />} />
      <Route path="/sizes/:token" element={<SizesPublic />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="people" element={<People />} />
        <Route path="people/new" element={<PersonForm />} />
        <Route path="people/:id/edit" element={<PersonForm />} />
        <Route path="departments" element={<Departments />} />
        <Route path="ppe" element={<PPECatalog />} />
        <Route path="stock" element={<Stock />} />
        <Route path="issuing" element={<Issuing />} />
        <Route path="issued" element={<IssuedPPE />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="size-requests" element={<SizeRequests />} />
        <Route path="signatures" element={<Signatures />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComplaintFeed from './pages/ComplaintFeed';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import DeptDashboard from './pages/DeptDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-stone-400 dark:bg-stone-950">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"    element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard"   element={<Dashboard />} />
      <Route path="complaints"  element={<ComplaintFeed />} />
      <Route path="complaints/new" element={<ProtectedRoute roles={['citizen','admin']}><NewComplaint /></ProtectedRoute>} />
      <Route path="complaints/:id" element={<ComplaintDetail />} />
      <Route path="map"         element={<MapPage />} />
      <Route path="profile"     element={<ProfilePage />} />
      <Route path="dept-dashboard" element={<ProtectedRoute roles={['department','admin']}><DeptDashboard /></ProtectedRoute>} />
      <Route path="admin"       element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // Role check yahan sirf UX ke liye hai (galat page dikhne se bachata hai) —
  // asal security backend ke adminOnly middleware se aati hai, isliye front-
  // end wala role check kabhi akela bharosa mand nahi hota
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, roles = [], allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const requiredRoles = roles.length > 0 ? roles : allowedRoles;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0) {
    const rawRole = user.role || (Array.isArray(user.roles) ? user.roles[0] : '');
    const userRole = rawRole.startsWith('ROLE_') ? rawRole : `ROLE_${rawRole}`;
    const normalizedRequired = requiredRoles.map((r) =>
      r.startsWith('ROLE_') ? r : `ROLE_${r}`
    );

    const hasPermission = normalizedRequired.includes(userRole);
    if (!hasPermission) {
      // Redirect to appropriate landing page
      if (userRole === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
      if (userRole === 'ROLE_HANDYMAN') return <Navigate to="/handyman" replace />;
      if (userRole === 'ROLE_INVENTORY_MANAGER') return <Navigate to="/inventory" replace />;
      if (userRole === 'ROLE_SUPPLIER') return <Navigate to="/supplier" replace />;
      return <Navigate to="/customer/bookings" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

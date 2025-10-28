import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

const ProtectedRoute: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <div>Error: AuthContext not found</div>;
  }

  return authContext.user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

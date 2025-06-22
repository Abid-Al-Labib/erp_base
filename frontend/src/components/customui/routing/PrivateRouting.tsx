import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import FullScreenLoader from '@/pages/FullScreenLoader';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  unauthorizedRedirectTo?: string;
  canAccess?: () => Promise<boolean> | boolean,
  accessDeniedRedirectTo?: string 
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRoles,
  unauthorizedRedirectTo = "/unauthorized",
  canAccess,
  accessDeniedRedirectTo

}) => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!session) {
        navigate("/login");
      } else if (!profile) {
        navigate("/profileNotFound");
      } else if (allowedRoles && !allowedRoles.includes(profile.permission)) {
        navigate(unauthorizedRedirectTo);
      } else if (canAccess && !canAccess()) {
        navigate(accessDeniedRedirectTo || unauthorizedRedirectTo)
      }

    }
  }, [session, profile, loading, allowedRoles, navigate, unauthorizedRedirectTo, canAccess, accessDeniedRedirectTo]);

  if (loading || !session || !profile) {
    return <FullScreenLoader />;
  }

  // All checks passed
  return <>{children}</>;
};

export default PrivateRoute;

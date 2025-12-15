import { authVerifyAuthOptions } from "@/lib/client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router";

export function ProtectedRoute() {
  const location = useLocation();
  const {
    data: isAuthenticated,
    isLoading,
    isError,
    error,
    isRefetching,
  } = useQuery({
    ...authVerifyAuthOptions(),
  });

  if (isLoading || isRefetching) {
    return null;
  }

  if (isError) {
    return <>Error: {error.message}</>;
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
}

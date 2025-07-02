import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { useLocation, Navigate } from "react-router-dom";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async () => {
    login(from);
  };

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Login Page</h1>
        <Button onClick={handleLogin}>Login</Button>
      </div>
    </div>
  );
}

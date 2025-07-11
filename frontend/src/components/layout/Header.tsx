import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { Link, useLocation, useNavigate } from "react-router";

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="container mx-auto flex flex-row justify-between p-2">
      <nav>
        <Button variant="link" asChild>
          <Link to="/">Home</Link>
        </Button>
        {isAuthenticated && (
          <Button variant="link" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        )}
        {isAuthenticated && (
          <Button variant="link" asChild>
            <Link to="/upload">Upload</Link>
          </Button>
        )}
        {isAuthenticated ? (
          <Button variant="link" onClick={() => handleLogout()}>
            Logout
          </Button>
        ) : (
          <Button variant="link" asChild>
            <Link to="/login" state={{ from: location }} replace>
              Login
            </Link>
          </Button>
        )}
      </nav>
      <ThemeToggle />
    </header>
  );
}

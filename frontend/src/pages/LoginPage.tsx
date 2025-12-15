import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useTitle } from "@/hooks/use-title";
import { Navigate, useLocation } from "react-router";
import einfraDark from "../assets/icons/einfra-dark.svg";
import einfraLight from "../assets/icons/einfra-light.svg";

export function LoginPage() {
  useTitle("Login");

  const { login, loginAsDemoUser, isAuthenticated } = useAuth();
  const location = useLocation();
  const fullPath = location.state?.from
    ? `${location.pathname}${location.search}${location.hash}`
    : "/dashboard";

  async function handleLogin() {
    login(fullPath);
  }

  function handleDemoLogin() {
    loginAsDemoUser(fullPath);
  }

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <img
            src={einfraLight}
            alt="EINFRA logo"
            className="block h-28 w-auto object-contain dark:hidden"
          />
          <img
            src={einfraDark}
            alt="EINFRA logo"
            className="hidden h-28 w-auto object-contain dark:block"
          />
          <h1 className="text-xl font-semibold">Login with EINFRA AAI</h1>
          <p className="text-sm text-muted-foreground">
            Use your institutional account to continue
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              onClick={handleDemoLogin}
              className="w-full"
            >
              Try as Demo User
            </Button>
          )}

          <Button onClick={handleLogin} className="w-full">
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

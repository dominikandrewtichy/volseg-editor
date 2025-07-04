import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthProvider";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import einfraLogo from "/public/einfra_logo.svg";
import lifeScienceLogo from "/public/lifescience_logo.png";

type LoginProviderKey = "einfra" | "lifescience";

const loginProviders: Partial<
  Record<
    LoginProviderKey,
    {
      name: string;
      logoSrc: string;
      description: string;
    }
  >
> = {
  einfra: {
    name: "e-INFRA CZ AAI",
    logoSrc: einfraLogo,
    description: "",
  },
  lifescience: {
    name: "Life Science Login",
    logoSrc: lifeScienceLogo,
    description: "",
  },
};

const LogoImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => <img src={src} alt={alt} className={className} />;

export function LoginPage() {
  const { login, loginAsDemoUser, isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [selectedAuth, setSelectedAuth] = useState<LoginProviderKey>("einfra");
  const selectedProvider = selectedAuth ? loginProviders[selectedAuth] : null;

  function onSelectedAuth(provider: LoginProviderKey) {
    setSelectedAuth(provider);
  }

  const handleLogin = async () => {
    login(from);
  };

  const handleDemoLogin = () => {
    loginAsDemoUser(from);
  };

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex items-center justify-center py-12 px-0 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <h1 className="text-3xl font-bold tracking-wide">CELLIM Viewer</h1>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-normal mb-6">Log in</h2>

              <Separator orientation="horizontal" className="my-3" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth-method" className="text-sm font-medium">
                    Authenticate using
                  </Label>
                  <Select value={selectedAuth} onValueChange={onSelectedAuth}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select authentication method">
                        {selectedProvider && (
                          <div className="flex items-center gap-3">
                            <LogoImage
                              src={selectedProvider.logoSrc}
                              alt={selectedProvider.name}
                              className="h-5 w-5 object-contain"
                            />
                            <span>{selectedProvider.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(loginProviders).map(([key, provider]) => {
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-3">
                              <LogoImage
                                src={provider.logoSrc}
                                alt={provider.name}
                                className="h-5 w-5 object-contain"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {provider.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {provider.description}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Alert variant="default">
                  <InfoIcon />
                  <AlertDescription>
                    If you are not sure which authentication method to use,
                    contact your administrator.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator orientation="horizontal" className="my-3 mt-6" />

              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handleDemoLogin}>
                  Try as Demo User
                </Button>
                <Button onClick={handleLogin}>Sign In</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

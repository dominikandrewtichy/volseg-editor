import { authVerifyAuthOptions } from "@/lib/client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useContext } from "react";
import { AuthService } from "../lib/auth-service";

interface AuthProviderProps {
  children: ReactNode;
}

type AuthProviderState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (redirectPath: string | undefined) => void;
  loginAsDemoUser: (redirectPath: string | undefined) => void;
  logout: () => Promise<void>;
};

const initialState: AuthProviderState = {
  isAuthenticated: false,
  isLoading: false,
  login: () => void undefined,
  loginAsDemoUser: () => void undefined,
  logout: async () => undefined,
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export const AuthProvider = ({ children, ...props }: AuthProviderProps) => {
  const { data, isLoading, isRefetching } = useQuery({
    ...authVerifyAuthOptions(),
  });

  console.log("AuthProvider", isLoading || isRefetching, !!data);

  const login = (redirectPath: string | undefined = "/") => {
    AuthService.login(redirectPath);
  };

  const loginAsDemoUser = (redirectPath: string | undefined = "/") => {
    AuthService.loginAsDemoUser(redirectPath);
  };

  const logout = async () => {
    await AuthService.logout();
  };

  const value = {
    isAuthenticated: !!data,
    isLoading: isLoading || isRefetching,
    login,
    logout,
    loginAsDemoUser,
  };

  return (
    <AuthProviderContext.Provider {...props} value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthProviderContext);

  if (context === undefined) throw new Error("Missing AuthProvider");

  return context;
};

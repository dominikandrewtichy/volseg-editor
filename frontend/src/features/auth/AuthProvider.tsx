import {
  authVerifyAuthOptions,
  authVerifyAuthQueryKey,
} from "@/lib/client/@tanstack/react-query.gen";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { AuthProviderContext, AuthProviderState } from "./AuthContext";
import { authLogout } from "@/lib/client";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children, ...props }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching } = useQuery({
    ...authVerifyAuthOptions(),
  });

  const login = (redirectPath: string | undefined = "/") => {
    const loginUrl = new URL(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
    );
    loginUrl.searchParams.set("redirect", redirectPath);
    window.location.href = loginUrl.toString();
  };

  const loginAsDemoUser = (redirectPath: string | undefined = "/") => {
    const loginUrl = new URL(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/demo-login`,
    );
    loginUrl.searchParams.set("redirect", redirectPath);
    window.location.href = loginUrl.toString();
  };

  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    queryClient.invalidateQueries({ queryKey: authVerifyAuthQueryKey() });
  };

  const value: AuthProviderState = {
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

import { createContext } from "react";

export type AuthProviderState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (redirectPath: string | undefined) => void;
  loginAsDemoUser: (redirectPath: string | undefined) => void;
  logout: () => Promise<void>;
};

export const initialAuthState: AuthProviderState = {
  isAuthenticated: false,
  isLoading: false,
  login: () => void 0,
  loginAsDemoUser: () => void 0,
  logout: async () => void 0,
};

export const AuthProviderContext =
  createContext<AuthProviderState>(initialAuthState);

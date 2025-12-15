import { useContext } from "react";
import { AuthProviderContext } from "../context/auth-context";

export const useAuth = () => {
  const context = useContext(AuthProviderContext);

  if (context === undefined) throw new Error("Missing AuthProvider");

  return context;
};

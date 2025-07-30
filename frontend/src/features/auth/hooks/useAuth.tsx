import { useContext } from "react";
import { AuthProviderContext } from "../AuthContext";

export const useAuth = () => {
  const context = useContext(AuthProviderContext);

  if (context === undefined) throw new Error("Missing AuthProvider");

  return context;
};

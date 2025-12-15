import { MolstarContext } from "@/context/molstar-context";
import { useContext } from "react";

export const useMolstar = () => {
  const context = useContext(MolstarContext);
  if (context === undefined) {
    throw new Error("useMolstar must be used within a MolstarProvider");
  }
  return context;
};

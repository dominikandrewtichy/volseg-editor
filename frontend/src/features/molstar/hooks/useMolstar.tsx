import { useContext } from "react";
import { MolstarContext } from "../MolstarContext";

export const useMolstar = () => {
  const context = useContext(MolstarContext);
  if (context === undefined) {
    throw new Error("useMolstar must be used within a MolstarProvider");
  }
  return context;
};

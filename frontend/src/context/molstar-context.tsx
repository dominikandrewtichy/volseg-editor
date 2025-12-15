import { MolstarModel } from "@/models/molstar-model";
import { createContext } from "react";

interface MolstarContextType {
  viewer: MolstarModel;
}

export const MolstarContext = createContext<MolstarContextType | undefined>(
  undefined,
);

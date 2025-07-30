import { createContext } from "react";
import { MolstarViewerModel } from "./models/molstar-viewer";

interface MolstarContextType {
  viewer: MolstarViewerModel;
}

export const MolstarContext = createContext<MolstarContextType | undefined>(
  undefined,
);

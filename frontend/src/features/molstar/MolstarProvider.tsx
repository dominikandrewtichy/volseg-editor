import { useRef } from "react";
import { MolstarContext } from "./MolstarContext";
import { MolstarViewerModel } from "./models/molstar-viewer";

interface MolstarProviderProps {
  children: React.ReactNode;
}

export const MolstarProvider: React.FC<MolstarProviderProps> = ({
  children,
}) => {
  const viewer = useRef<MolstarViewerModel>(new MolstarViewerModel());

  const value = {
    viewer: viewer.current,
  };

  return (
    <MolstarContext.Provider value={value}>{children}</MolstarContext.Provider>
  );
};

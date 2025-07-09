import { MolstarViewerModel } from "@/lib/models/molstar-viewer";
import { createContext, useContext, useEffect, useRef } from "react";

interface MolstarContextType {
  viewer: MolstarViewerModel;
}

const MolstarContext = createContext<MolstarContextType | undefined>(undefined);

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

export const useMolstar = () => {
  const context = useContext(MolstarContext);
  if (context === undefined) {
    throw new Error("useMolstar must be used within a MolstarProvider");
  }
  // useEffect(() => {
  //   return () => {
  //     context.viewer.clear();
  //   };
  // }, [context.viewer]);
  return context;
};

import { MolstarModel } from "@/models/molstar-model";
import { useRef } from "react";
import { MolstarContext } from "./molstar-context";

interface MolstarProviderProps {
  children: React.ReactNode;
}

export const MolstarProvider: React.FC<MolstarProviderProps> = ({
  children,
}) => {
  const viewer = useRef<MolstarModel>(new MolstarModel());

  const value = {
    viewer: viewer.current,
  };

  return (
    <MolstarContext.Provider value={value}>{children}</MolstarContext.Provider>
  );
};

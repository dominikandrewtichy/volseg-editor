import { useBehavior } from "@/hooks/use-behavior";
import { useMolstar } from "@/hooks/use-molstar";
import { Plugin } from "molstar/lib/mol-plugin-ui/plugin";
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { useEffect } from "react";

export default function Molstar() {
  const { viewer } = useMolstar();

  const isInitialized = useBehavior(viewer.state.isInitialized);

  useEffect(() => {
    viewer.init();
  }, [viewer]);

  return (
    <div className="relative size-full rounded-lg overflow-hidden border-2 z-20">
      {isInitialized && <Plugin plugin={viewer.plugin} />}
    </div>
  );
}

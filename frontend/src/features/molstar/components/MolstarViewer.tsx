import { useBehavior } from "@/features/molstar/hooks/useBehavior";
import { useEffect } from "react";
import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import { ViewerLayout } from "@/features/molstar/components/ViewerLayout";

export default function MolstarViewer() {
  const { viewer } = useMolstar();

  const isInitialized = useBehavior(viewer.state.isInitialized);

  useEffect(() => {
    viewer.init();
  }, [viewer]);

  return (
    <div className="relative size-full rounded-lg overflow-hidden border-2">
      {/* {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform z-20">
          <LoaderCircleIcon className="w-6 h-6 animate-spin" />
        </div>
      )} */}

      {isInitialized && <ViewerLayout viewer={viewer} />}
    </div>
  );
}

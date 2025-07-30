import { BaseReactiveModel } from "@/lib/models/base-model";
import { useEffect } from "react";

export function useReactiveModel<T extends BaseReactiveModel>(
  model: T | undefined,
  init?: () => Promise<void>,
) {
  useEffect(() => {
    async function setup() {
      if (!model) return;
      if (init) await init();
      model.mount();
    }

    if (!model) return;
    setup();

    return () => {
      model.dispose();
    };
  }, [init, model]);
  return model;
}

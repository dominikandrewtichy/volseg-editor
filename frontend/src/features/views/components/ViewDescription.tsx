import { ViewResponse } from "@/lib/client";

interface ViewDescriptionProps {
  view: ViewResponse;
}

export function ViewDescription({ view }: ViewDescriptionProps) {
  return (
    <p className="text-xs text-muted-foreground line-clamp-2">
      {view.description}
    </p>
  );
}

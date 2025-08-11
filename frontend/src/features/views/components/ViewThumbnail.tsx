import { Badge } from "@/components/ui/badge";
import { ViewResponse } from "@/lib/client";
import { ImageIcon } from "lucide-react";

interface ViewThumbnailProps {
  view: ViewResponse;
}

export function ViewThumbnail({ view }: ViewThumbnailProps) {
  const thumbnailUrl = `${import.meta.env.VITE_API_URL}/api/v1/entries/${view.entry_id}/views/${view.id}/thumbnail`;

  return (
    <div className="pb-2">
      <div className="aspect-video bg-secondary rounded-md overflow-hidden flex items-center justify-center relative">
        {view.is_thumbnail && (
          <Badge variant="outline" className="absolute top-2 left-2">
            Default
          </Badge>
        )}
        {view.thumbnail_url ? (
          <img
            src={thumbnailUrl}
            alt={`${view.name} thumbnail`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

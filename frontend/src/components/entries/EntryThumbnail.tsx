// src/components/entries/EntryThumbnail.tsx
import { ImageIcon } from "lucide-react";

interface EntryThumbnailProps {
  entryId: string;
  viewId?: string | null;
  viewName?: string | null;
}

export function EntryThumbnail({
  entryId,
  viewId,
  viewName: thumbnailName,
}: EntryThumbnailProps) {
  if (!viewId) {
    return <ImageIcon className="h-8 w-8 text-muted-foreground" />;
  }

  const thumbnailUrl = `${import.meta.env.VITE_API_URL}/api/v1/entries/${entryId}/views/${viewId}/thumbnail`;

  return (
    <img
      src={thumbnailUrl}
      alt={`${thumbnailName || "Entry"} thumbnail`}
      className="w-full h-full object-cover"
    />
  );
}

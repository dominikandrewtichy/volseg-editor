import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { EntryResponse } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { viewsListViewsForEntryOptions } from "@/lib/client/@tanstack/react-query.gen";

export function EntryPreview({ entry }: { entry: EntryResponse }) {
  const viewsQuery = useQuery({
    ...viewsListViewsForEntryOptions({
      path: {
        entry_id: entry.id,
      },
    }),
  });

  const entryThumbnail = viewsQuery.data?.filter((entry) => entry.is_thumbnail);

  return (
    <Card
      key={entry.id}
      className="overflow-hidden hover:shadow-lg transition-shadow min-h-72"
    >
      <div className="aspect-video bg-secondary overflow-hidden flex items-center justify-center">
        {entryThumbnail && viewsQuery.data && entryThumbnail.length > 0 ? (
          <img
            src={`${import.meta.env.VITE_API_URL}/api/v1/entries/${entry.id}/views/${viewsQuery.data[0]!.id}/thumbnail`}
            alt={`${entryThumbnail[0]!.name} thumbnail`}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <CardContent className="flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-2">{entry.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-4 overflow-hidden text-ellipsis">
          {entry.description}
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="secondary" size="sm" asChild>
          <Link to={`/entries/${entry.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

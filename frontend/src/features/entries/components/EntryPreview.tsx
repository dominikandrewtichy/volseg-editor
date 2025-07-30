// src/components/entries/EntryPreview.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router";
import { Button } from "../../../components/ui/button";
import { EntryResponse } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { entriesGetEntryThumbnailViewOptions } from "@/lib/client/@tanstack/react-query.gen";
import { EntryThumbnail } from "./EntryThumbnail"; // Import the new component

export function EntryPreview({ entry }: { entry: EntryResponse }) {
  const entryThumbnailQuery = useQuery({
    ...entriesGetEntryThumbnailViewOptions({
      path: {
        entry_id: entry.id,
      },
    }),
  });

  const entryThumbnail = entryThumbnailQuery.data;

  return (
    <Card
      key={entry.id}
      className="overflow-hidden hover:shadow-lg transition-shadow min-h-72"
    >
      <div className="aspect-video bg-secondary overflow-hidden flex items-center justify-center">
        <EntryThumbnail
          entryId={entry.id}
          viewId={entryThumbnail?.id}
          viewName={entryThumbnail?.name}
        />
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

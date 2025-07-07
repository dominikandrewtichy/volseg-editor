import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Camera } from "lucide-react";
import { ViewCard } from "./ViewCard";
import { useQuery } from "@tanstack/react-query";
import { viewsListViewsForEntryOptions } from "@/lib/client/@tanstack/react-query.gen";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface ViewsSidebarProps {
  entryId: string;
  isEditable: boolean;
  onSaveView: () => void;
}

export function ViewsSidebar({
  entryId,
  onSaveView,
  isEditable,
}: ViewsSidebarProps) {
  const listViewsQuery = useQuery({
    ...viewsListViewsForEntryOptions({
      path: {
        entry_id: entryId!,
      },
    }),
    enabled: !!entryId,
  });

  if (listViewsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {listViewsQuery.error.message || "Failed to load data"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!listViewsQuery.data) return;

  const sortedViews = [...listViewsQuery.data].sort((a, b) => {
    if (a.is_thumbnail === b.is_thumbnail) return 0;
    return a.is_thumbnail ? -1 : 1;
  });

  return (
    <div className="flex flex-col h-full w-96">
      <div className="flex items-center justify-between mb-2 pr-4">
        {/* <h2 className="text-xl font-bold">Saved Views</h2> */}
        {isEditable && (
          <Button
            variant="secondary"
            size="sm"
            className="gap-1"
            onClick={onSaveView}
          >
            <Camera size={16} />
            <span>Save View</span>
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0 pb-0 pr-4">
        <div className="flex flex-col gap-y-3">
          {sortedViews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No views saved yet</p>
            </div>
          ) : (
            <>
              {sortedViews.map((view) => (
                <div key={view.id} className="transition-transform">
                  <ViewCard view={view} isEditable={isEditable} />
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

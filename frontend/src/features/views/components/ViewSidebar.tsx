import { ScrollArea } from "@/components/ui/scroll-area";
import {
  viewsListViewsForEntryOptions,
  viewsReorderEntryViewsMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ViewCard } from "./ViewCard";
import React, { useState } from "react"; // Import React and useState
import { cn } from "@/lib/utils";
import { ViewResponse } from "@/lib/client";

interface ViewsSidebarProps {
  entryId: string;
  isEditable: boolean;
  onSaveView: () => void;
}

export function ViewsSidebar({ entryId, isEditable }: ViewsSidebarProps) {
  const queryClient = useQueryClient();
  const listViewsQuery = useQuery({
    ...viewsListViewsForEntryOptions({
      path: {
        entry_id: entryId!,
      },
    }),
    enabled: !!entryId,
  });

  const [dropPosition, setDropPosition] = useState<"above" | "below" | null>(
    null,
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const reorderViewsMutation = useMutation({
    ...viewsReorderEntryViewsMutation(),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({
        queryKey: viewsListViewsForEntryOptions({
          path: { entry_id: entryId! },
        }).queryKey,
      });

      const previousViews = queryClient.getQueryData(
        viewsListViewsForEntryOptions({ path: { entry_id: entryId! } })
          .queryKey,
      );

      // Optimistically update based on the order that the drag operation would result in
      queryClient.setQueryData(
        viewsListViewsForEntryOptions({ path: { entry_id: entryId! } })
          .queryKey,
        newOrder.body.view_ids.map((id: string) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (previousViews as any[]).find((view) => view.id === id);
        }),
      );
      return { previousViews };
    },
    onError: (_err, _newOrder, context) => {
      if (context?.previousViews) {
        queryClient.setQueryData(
          viewsListViewsForEntryOptions({ path: { entry_id: entryId! } })
            .queryKey,
          context.previousViews,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: viewsListViewsForEntryOptions({
          path: { entry_id: entryId! },
        }).queryKey,
      });
    },
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

  if (!listViewsQuery.data) return null;

  const currentViews = listViewsQuery.data as ViewResponse[];

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    viewId: string,
  ) => {
    if (!isEditable) {
      e.preventDefault();
      return;
    }
    setDraggedId(viewId);
    e.dataTransfer.effectAllowed = "move";
    // Set data for drag operation (optional, but good practice)
    e.dataTransfer.setData("text/plain", viewId);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    viewId: string,
  ) => {
    e.preventDefault();
    if (!isEditable || draggedId === viewId) return;

    const targetRect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const midpoint = targetRect.top + targetRect.height / 2;

    setDragOverId(viewId);
    setDropPosition(mouseY < midpoint ? "above" : "below");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if leaving the current target, not just moving within it
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!isEditable || !draggedId || draggedId === targetId) return;

    const draggedIndex = currentViews.findIndex(
      (view) => view.id === draggedId,
    );
    const targetIndex = currentViews.findIndex((view) => view.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const reorderedViews = [...currentViews];
    const [draggedView] = reorderedViews.splice(draggedIndex, 1);

    const insertIndex =
      dropPosition === "above" ? targetIndex : targetIndex + 1;
    reorderedViews.splice(insertIndex, 0, draggedView!);

    reorderViewsMutation.mutate({
      path: { entry_id: entryId! },
      body: { view_ids: reorderedViews.map((view) => view.id) },
    });

    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  return (
    <ScrollArea className="h-full p-3 border rounded-md">
      <div className="space-y-3">
        {currentViews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No views saved yet</p>
          </div>
        ) : (
          <>
            {currentViews.map((view, index) => (
              <div
                key={view.id}
                draggable={isEditable}
                onDragStart={(e) => handleDragStart(e, view.id)}
                onDragOver={(e) => handleDragOver(e, view.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, view.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "transition-all duration-100 ease-in-out transform rounded-xl bg-background",
                  isEditable && "cursor-grab active:cursor-grabbing",
                  draggedId === view.id &&
                    "scale-95 opacity-40 shadow-md border-dashed border-2 border-primary rounded-md",
                  dragOverId === view.id && draggedId !== view.id && "z-10",
                )}
              >
                <ViewCard
                  view={view}
                  isEditable={isEditable}
                  order={index + 1}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </ScrollArea>
  );
}

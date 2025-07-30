import { ScrollArea } from "@/components/ui/scroll-area";
import {
  viewsListViewsForEntryOptions,
  viewsReorderEntryViewsMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ViewCard } from "./ViewCard";
import { toast } from "sonner";
import React, { useState } from "react"; // Import React and useState

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
          return (previousViews as any[]).find((view) => view.id === id);
        }),
      );
      return { previousViews };
    },
    onError: (err, newOrder, context) => {
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

  const currentViews = listViewsQuery.data;

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
    e.preventDefault(); // Necessary to allow dropping
    if (!isEditable || draggedId === viewId) {
      return;
    }
    setDragOverId(viewId);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if leaving the current target, not just moving within it
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!isEditable || !draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = currentViews.findIndex(
      (view) => view.id === draggedId,
    );
    const targetIndex = currentViews.findIndex((view) => view.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const reorderedViews = Array.from(currentViews);
    const [draggedView] = reorderedViews.splice(draggedIndex, 1);
    reorderedViews.splice(targetIndex, 0, draggedView);

    reorderViewsMutation.mutate({
      path: { entry_id: entryId! },
      body: { view_ids: reorderedViews.map((view) => view.id) },
    });

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <ScrollArea className="p-2 pr-3 rounded-xl border h-full">
      <div className="space-y-3">
        {currentViews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No views saved yet</p>
          </div>
        ) : (
          <>
            {currentViews.map((view) => (
              <div
                key={view.id}
                draggable={isEditable} // Only draggable if editable
                onDragStart={(e) => handleDragStart(e, view.id)}
                onDragOver={(e) => handleDragOver(e, view.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, view.id)}
                onDragEnd={handleDragEnd}
                className={`transition-all ${isEditable ? "cursor-grab active:cursor-grabbing" : ""} ${draggedId === view.id ? "opacity-50 border-dashed border-2 border-primary" : ""} ${dragOverId === view.id && draggedId !== view.id ? "border-2 border-primary-foreground scale-[1.01]" : ""}`}
                style={{
                  // Optional: add a specific style to indicate where the item will drop
                  // if dragOverId is above or below the current item
                  borderTop:
                    dragOverId === view.id &&
                    draggedId !== null &&
                    currentViews.findIndex((v) => v.id === draggedId) >
                      currentViews.findIndex((v) => v.id === view.id)
                      ? "2px solid var(--primary)"
                      : "",
                  borderBottom:
                    dragOverId === view.id &&
                    draggedId !== null &&
                    currentViews.findIndex((v) => v.id === draggedId) <
                      currentViews.findIndex((v) => v.id === view.id)
                      ? "2px solid var(--primary)"
                      : "",
                }}
              >
                <ViewCard view={view} isEditable={isEditable} />
              </div>
            ))}
          </>
        )}
      </div>
    </ScrollArea>
  );
}

import {
  viewsListViewsForEntryOptions,
  viewsReorderEntryViewsMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function useViewReorder(entryId: string, isEditable: boolean) {
  const queryClient = useQueryClient();
  const { data: views } = useQuery({
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
    if (!views || !isEditable || !draggedId || draggedId === targetId) return;

    const draggedIndex = views.findIndex((view) => view.id === draggedId);
    const targetIndex = views.findIndex((view) => view.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const reorderedViews = [...views];
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

  return {
    views,
    draggedId,
    dragOverId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

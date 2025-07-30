import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import { ViewResponse } from "@/lib/client";
import {
  viewsDeleteViewMutation,
  viewsGetViewByIdQueryKey,
  viewsGetViewSnapshotOptions,
  viewsListViewsForEntryQueryKey,
  viewsUpdateViewMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ViewCardActions } from "./ViewCardActions";
import { EditViewDialog } from "./ViewEditDialog";

interface ViewCardProps {
  view: ViewResponse;
  isEditable: boolean;
  order: number;
}

export function ViewCard({ view, isEditable, order }: ViewCardProps) {
  const { viewer } = useMolstar();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);

  const viewSnapshot = useQuery({
    ...viewsGetViewSnapshotOptions({
      path: {
        entry_id: view.entry_id,
        view_id: view.id,
      },
    }),
    enabled: false, // don't run on mount
  });

  const updateViewMutation = useMutation({
    ...viewsUpdateViewMutation(),
    onSuccess: (view) => {
      toast.success(`View "${view.name}" set a default thumbnail`);
      queryClient.invalidateQueries({
        queryKey: viewsListViewsForEntryQueryKey({
          path: { entry_id: view.entry_id },
        }),
      });
    },
  });

  const deleteViewMutation = useMutation({
    ...viewsDeleteViewMutation(),
    onSuccess: (deletedViewId) => {
      toast.success("View deleted successfully");
      queryClient.invalidateQueries({
        queryKey: viewsGetViewByIdQueryKey({
          path: { entry_id: view.entry_id, view_id: deletedViewId },
        }),
      });
      queryClient.invalidateQueries({
        queryKey: viewsListViewsForEntryQueryKey({
          path: { entry_id: view.entry_id },
        }),
      });
    },
  });

  async function handleLoadView() {
    const { data } = await viewSnapshot.refetch();
    await viewer.loadSnapshot(data);
  }

  async function onSetAsThumbnail() {
    updateViewMutation.mutate({
      path: {
        entry_id: view.entry_id,
        view_id: view.id,
      },
      body: {
        is_thumbnail: true,
      },
    });
  }

  function onDelete() {
    deleteViewMutation.mutate({
      path: {
        entry_id: view.entry_id,
        view_id: view.id,
      },
    });
  }

  return (
    <>
      <Card className="transition-all relative hover:shadow-md border-2 rounded-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-x-2">
              <CardTitle className="text-base">
                {order}. {view.name}
              </CardTitle>
            </div>
            <ViewCardActions
              onSetAsThumbnail={onSetAsThumbnail}
              onEdit={() => setEditOpen(true)}
              onDelete={onDelete}
              isEditable={isEditable}
              isThumbnail={view.is_thumbnail}
            />
          </div>
        </CardHeader>

        {/* Screenshot */}
        <div className="px-6 pb-2">
          <div className="aspect-video bg-secondary rounded-md overflow-hidden flex items-center justify-center relative">
            {view.is_thumbnail && (
              <Label className="absolute top-2 left-2 bg-primary/50 text-primary-foreground text-xs px-2 py-0.5  rounded-2xl z-10">
                Default
              </Label>
            )}
            {view.thumbnail_url ? (
              <img
                src={`${import.meta.env.VITE_API_URL}/api/v1/entries/${view.entry_id}/views/${view.id}/thumbnail`}
                alt={`${view.name} thumbnail`}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </div>

        <CardContent>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {view.description}
          </p>
        </CardContent>
        <CardFooter className="justify-center pt-2">
          <Button
            onClick={handleLoadView}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Load
          </Button>
        </CardFooter>
      </Card>

      <EditViewDialog view={view} open={editOpen} setOpen={setEditOpen} />
    </>
  );
}

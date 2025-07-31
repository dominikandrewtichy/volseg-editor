import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ViewResponse } from "@/lib/client";
import { useState } from "react";
import { ViewCardActions } from "./ViewCardActions";
import { ViewDescription } from "./ViewDescription";
import { EditViewDialog } from "./ViewEditDialog";
import { ViewThumbnail } from "./ViewThumbnail";
import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import {
  viewsGetViewSnapshotOptions,
  viewsUpdateViewMutation,
  viewsListViewsForEntryQueryKey,
  viewsDeleteViewMutation,
  viewsGetViewByIdQueryKey,
} from "@/lib/client/@tanstack/react-query.gen";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface ViewCardProps {
  view: ViewResponse;
  isEditable: boolean;
  order: number;
}

export function ViewCard({ view, isEditable, order }: ViewCardProps) {
  const queryClient = useQueryClient();
  const { viewer } = useMolstar();

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

  async function loadView() {
    const { data } = await viewSnapshot.refetch();
    await viewer.loadSnapshot(data);
  }

  async function setAsThumbnail() {
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

  function deleteView() {
    deleteViewMutation.mutate({
      path: {
        entry_id: view.entry_id,
        view_id: view.id,
      },
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>
            {order}. {view.name}
          </CardTitle>
          <ViewCardActions
            onEdit={() => setEditOpen(true)}
            onDelete={deleteView}
            onSetAsThumbnail={setAsThumbnail}
            isEditable={isEditable}
            isThumbnail={view.is_thumbnail}
          />
        </CardHeader>

        <CardContent>
          <ViewThumbnail view={view} />
          <ViewDescription view={view} />
        </CardContent>

        <CardFooter className="justify-center">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={loadView}
          >
            Load
          </Button>
        </CardFooter>
      </Card>

      <EditViewDialog view={view} open={editOpen} setOpen={setEditOpen} />
    </>
  );
}

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
import { useState } from "react";
import { toast } from "sonner";
import { ViewCardActions } from "./ViewCardActions";
import { ViewDescription } from "./ViewDescription";
import { EditViewDialog } from "./ViewEditDialog";
import { ViewThumbnail } from "./ViewThumbnail";
import { ViewDeleteDialog } from "./ViewDeleteDialog";

interface ViewCardProps {
  view: ViewResponse;
  isEditable: boolean;
  order: number;
}

export function ViewCard({ view, isEditable, order }: ViewCardProps) {
  const queryClient = useQueryClient();
  const { viewer } = useMolstar();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>
            {order}. {view.name}
          </CardTitle>
          <ViewCardActions
            onEdit={() => setEditOpen(true)}
            onDelete={() => setDeleteOpen(true)}
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
      <ViewDeleteDialog view={view} open={deleteOpen} setOpen={setDeleteOpen} />
    </>
  );
}

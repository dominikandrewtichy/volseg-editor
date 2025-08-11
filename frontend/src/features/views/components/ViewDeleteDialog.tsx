import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ViewResponse } from "@/lib/client";
import {
  viewsDeleteViewMutation,
  viewsListViewsForEntryQueryKey,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ViewDeleteDialogProps {
  view: ViewResponse;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function ViewDeleteDialog({
  view,
  open,
  setOpen,
}: ViewDeleteDialogProps) {
  const queryClient = useQueryClient();

  const deleteViewMutation = useMutation({
    ...viewsDeleteViewMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: viewsListViewsForEntryQueryKey({
          path: { entry_id: view.entry_id },
        }),
      });
      setOpen(false);
    },
    onError: (error) => {
      toast.error(
        "Failed to delete view: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    },
  });

  function deleteView() {
    deleteViewMutation.mutate({
      path: {
        entry_id: view.entry_id,
        view_id: view.id,
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={deleteView}>
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

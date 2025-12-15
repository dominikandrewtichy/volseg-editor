import { type EntryResponse } from "@/lib/client";
import {
  authGetUserQueryKey,
  entriesDeleteEntryMutation,
  entriesListUserEntriesQueryKey,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface DeleteEntryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  entry: EntryResponse | null;
}

export function DeleteEntryDialog({
  open,
  setOpen,
  entry,
}: DeleteEntryDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    ...entriesDeleteEntryMutation(),
    onSuccess: async () => {
      toast.success("Entry deleted");
      await queryClient.resetQueries({
        queryKey: entriesListUserEntriesQueryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: authGetUserQueryKey(),
      });
    },
  });

  function handleDelete() {
    if (!entry) return;

    deleteMutation.mutate({
      path: {
        entry_id: entry.id,
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
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

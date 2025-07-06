import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  entriesDeleteEntryMutation,
  entriesGetEntryByIdOptions,
} from "@/lib/client/@tanstack/react-query.gen";

export function useEntryDetails(entryId: string) {
  const navigate = useNavigate();

  const entryQuery = useQuery({
    ...entriesGetEntryByIdOptions({
      path: {
        entry_id: entryId!,
      },
    }),
    enabled: !!entryId,
  });

  const deleteEntryMutation = useMutation({
    ...entriesDeleteEntryMutation(),
    onSuccess: () => {
      toast.success("Entry deleted successfully");
      navigate("/");
    },
    onError: (error) => {
      toast.error(
        "Failed to delete entry: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    },
  });

  const handleDeleteEntry = (confirm: boolean) => {
    if (confirm) {
      deleteEntryMutation.mutate({ path: { entry_id: entryId } });
    }
  };

  return {
    entry: entryQuery.data,
    isLoading: entryQuery.isLoading,
    error: entryQuery.error,
    handleDeleteEntry,
    isDeleting: deleteEntryMutation.isPending,
  };
}

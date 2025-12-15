import {
  type EntryResponse,
  type EntryUpdateRequest,
  zEntryUpdateRequest,
} from "@/lib/client";
import {
  entriesListUserEntriesQueryKey,
  entriesUpdateEntryMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface UpdateEntryFormProps {
  entry: EntryResponse;
  setDialogOpen: (open: boolean) => void;
}

export function UpdateEntryForm({
  entry,
  setDialogOpen,
}: UpdateEntryFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<EntryUpdateRequest>({
    resolver: zodResolver(zEntryUpdateRequest),
    defaultValues: {
      name: entry.name,
    },
  });

  const updateMutation = useMutation({
    ...entriesUpdateEntryMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: entriesListUserEntriesQueryKey(),
      });
    },
    onError: () => {
      toast.error("Failed to update dataset.");
    },
  });

  function handleUpdate(request: EntryUpdateRequest) {
    updateMutation.mutate({
      path: { entry_id: entry.id },
      body: { name: request.name },
    });
    form.reset();
    setDialogOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Name"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {updateMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {updateMutation.error instanceof Error ? (
                updateMutation.error.message
              ) : typeof updateMutation.error === "object" &&
                updateMutation.error !== null &&
                "detail" in updateMutation.error ? (
                Array.isArray(
                  (updateMutation.error as { detail: any }).detail,
                ) ? (
                  (
                    (updateMutation.error as { detail: any }).detail as any[]
                  ).map((error, index) => <div key={index}>{error.msg}</div>)
                ) : (
                  <div>{(updateMutation.error as { detail: any }).detail}</div>
                )
              ) : (
                <div>An unknown error occurred</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            className="justify-self-end"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

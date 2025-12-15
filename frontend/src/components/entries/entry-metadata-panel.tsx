import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  type EntryResponse,
  type EntryUpdateRequest,
  zEntryUpdateRequest,
} from "@/lib/client";
import {
  entriesGetEntryByIdQueryKey,
  entriesUpdateEntryMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Editor } from "../tiptap/editor";

interface EntryMetadataPanelProps {
  entry: EntryResponse;
  readOnly?: boolean;
}

export function EntryMetadataPanel({
  entry,
  readOnly = false,
}: EntryMetadataPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<EntryUpdateRequest>({
    resolver: zodResolver(zEntryUpdateRequest),
    defaultValues: {
      title: entry.title || "",
      description: entry.description || "",
      name: entry.name,
    },
  });

  useEffect(() => {
    form.reset({
      title: entry.title || "",
      description: entry.description || "",
      name: entry.name,
    });
  }, [entry, form]);

  const updateMutation = useMutation({
    ...entriesUpdateEntryMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: entriesGetEntryByIdQueryKey({ path: { entry_id: entry.id } }),
      });
      toast.success("Entry updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update entry");
    },
  });

  function onSubmit(data: EntryUpdateRequest) {
    updateMutation.mutate({
      path: { entry_id: entry.id },
      body: data,
    });
  }

  if (isEditing && !readOnly) {
    return (
      <div className="h-full flex flex-col gap-6 p-4 border-r bg-sidebar/30 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Details</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsEditing(false)}
              disabled={updateMutation.isPending}
              title="Cancel"
            >
              <XIcon className="size-4 text-muted-foreground hover:text-destructive" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateMutation.isPending}
              title="Save"
            >
              {updateMutation.isPending ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <CheckIcon className="size-4" />
              )}
            </Button>
          </div>{" "}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Title"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Editor
                      value={field.value}
                      onChange={field.onChange}
                      isEditing={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-4 border-r bg-sidebar/30 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">
          {entry.title || "Untitled Entry"}
        </h1>
        {!readOnly && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <PencilIcon className="size-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Description
        </h3>
        {entry.description ? (
          <Editor
            value={entry.description}
            isEditing={false}
            key={entry.id + entry.updated_at}
          />
        ) : (
          <span className="italic text-muted-foreground">
            No description provided.
          </span>
        )}
      </div>

      <div className="mt-auto pt-6 border-t">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Created: {new Date(entry.created_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

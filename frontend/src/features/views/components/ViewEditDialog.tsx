// src/components/views/ViewEditDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ViewResponse,
  ViewUpdateRequest,
  zViewUpdateRequest,
} from "@/lib/client";
import {
  viewsListViewsForEntryQueryKey,
  viewsUpdateViewMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface EditViewDialogProps {
  view: ViewResponse;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function EditViewDialog({ view, open, setOpen }: EditViewDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<ViewUpdateRequest>({
    resolver: zodResolver(zViewUpdateRequest),
  });

  const updateViewMutation = useMutation({
    ...viewsUpdateViewMutation(),
    onSuccess: (updatedView) => {
      toast.success(`View "${updatedView.name}" updated successfully`);
      queryClient.invalidateQueries({
        queryKey: viewsListViewsForEntryQueryKey({
          path: { entry_id: view.entry_id },
        }),
      });
      setOpen(false);
    },
    onError: (error) => {
      toast.error(
        "Failed to update view: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    },
  });

  function handleSubmit(data: ViewUpdateRequest) {
    updateViewMutation.mutate({
      path: {
        entry_id: view.entry_id,
        view_id: view.id,
      },
      body: {
        ...data,
      },
    });
  }

  function handleCancel() {
    setOpen(false);
  }

  useEffect(() => {
    if (open) {
      form.reset({
        name: view.name,
        description: view.description,
        is_thumbnail: view.is_thumbnail,
      });
    }
  }, [form, open, view.description, view.is_thumbnail, view.name]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <DialogHeader>
              <DialogTitle>Edit View</DialogTitle>
              <DialogDescription>
                Update the name and description for this view
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-video mt-2 bg-secondary rounded-md overflow-hidden flex items-center justify-center">
                {view.thumbnail_url ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/api/v1/entries/${view?.entry_id}/views/${view?.id}/thumbnail`}
                    alt="View preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Camera size={32} className="mb-2" />
                    <p className="text-xs">No preview available</p>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="View name"
                      value={field.value ?? ""}
                      onChange={field.onChange}
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
                    <Input
                      placeholder="View description"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_thumbnail"
              render={({ field }) => (
                <FormItem className="flex flex-row gap-x-3 items-center">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={!view.thumbnail_url}
                    />
                  </FormControl>
                  <FormLabel>Set as default thumbnail</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                variant="secondary"
                type="button"
                disabled={updateViewMutation.isPending}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                type="submit"
                disabled={updateViewMutation.isPending}
              >
                {updateViewMutation.isPending ? "Updating..." : "Update Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

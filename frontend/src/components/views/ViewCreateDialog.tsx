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
import { useMolstar } from "@/contexts/MolstarProvider";
import {
  EntryResponse,
  ViewCreateRequest,
  zViewCreateRequest,
} from "@/lib/client";
import {
  viewsCreateViewMutation,
  viewsListViewsForEntryQueryKey,
} from "@/lib/client/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { PluginState } from "molstar/lib/mol-plugin/state";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { z } from "zod";

interface ViewCreateDialogProps {
  entry: EntryResponse;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function ViewCreateDialog({
  entry,
  open,
  setOpen,
}: ViewCreateDialogProps) {
  const queryClient = useQueryClient();
  const { viewer } = useMolstar();

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [snapshotBlob, setSnapshotBlob] = useState<Blob | undefined>(undefined);
  const [thumbnailImage, setThumbnailImage] = useState<File | undefined>(
    undefined,
  );

  const zViewCreateRequestExtend = zViewCreateRequest.extend({
    snapshot_json: z.any(),
    thumbnail_image: z.any(),
  });

  const form = useForm<ViewCreateRequest>({
    resolver: zodResolver(zViewCreateRequestExtend),
    defaultValues: {
      name: "",
      description: "",
      is_thumbnail: false,
      snapshot_json: undefined,
      thumbnail_image: undefined,
    },
  });

  const createViewMutation = useMutation({
    ...viewsCreateViewMutation({
      requestValidator: async (data: any) => {
        return await zViewCreateRequestExtend.parseAsync(data.body);
      },
    }),
    onSuccess: (newView) => {
      toast.success(`View "${newView.name}" created successfully`);
      queryClient.invalidateQueries({
        queryKey: viewsListViewsForEntryQueryKey({
          path: { entry_id: entry.id },
        }),
      });
      setOpen(false);
    },
    onError: (error) => {
      toast.error(
        "Failed to create view: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    },
  });

  function handleSubmit(data: ViewCreateRequest) {
    createViewMutation.mutate({
      path: {
        entry_id: entry.id,
      },
      body: {
        ...data,
        snapshot_json: snapshotBlob,
        thumbnail_image: thumbnailImage,
      },
    });
  }

  function handleCancel() {
    setOpen(false);
  }

  useEffect(() => {
    async function reset() {
      try {
        const url = await viewer.screenshot();
        const thumbnail_image = await viewer.thumbnailImage();
        const snapshot: PluginState.Snapshot = viewer.getState();
        const snapshotJson = JSON.stringify(snapshot);
        const snapshotBlob = new Blob([snapshotJson], {
          type: "application/json",
        });
        setPreviewUrl(url);
        setThumbnailImage(thumbnail_image);
        setSnapshotBlob(snapshotBlob);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    if (open) {
      form.reset({
        name: undefined,
        description: undefined,
        is_thumbnail: false,
      });

      reset();
    }
  }, [form, open, viewer]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <DialogHeader>
              <DialogTitle>Save Current View</DialogTitle>
              <DialogDescription>
                Provide a name and description for this view
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-video mt-2 bg-secondary rounded-md overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="View preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Camera size={32} className="mb-2" />
                    <p className="text-xs">Generating preview...</p>
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
                    <Input placeholder="View name" {...field} />
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
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
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
                disabled={createViewMutation.isPending}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createViewMutation.isPending}>
                {createViewMutation.isPending ? "Creating..." : "Create Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

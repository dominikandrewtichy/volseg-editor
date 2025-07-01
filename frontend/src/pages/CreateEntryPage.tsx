import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  EntriesCreateEntryResponse,
  EntryCreateRequest,
  zEntryCreateRequest,
} from "@/lib/client";
import {
  entriesCreateEntryMutation,
  meListVolsegEntriesForUserOptions,
  volsegEntriesListPublicEntriesOptions,
} from "@/lib/client/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EntryCreatePage() {
  const navigate = useNavigate();

  const form = useForm<EntryCreateRequest>({
    resolver: zodResolver(zEntryCreateRequest),
    defaultValues: {
      name: "",
      description: "",
      is_public: false,
    },
  });

  const publicVolsegQuery = useQuery({
    ...volsegEntriesListPublicEntriesOptions(),
  });

  const privateVolsegQuery = useQuery({
    ...meListVolsegEntriesForUserOptions(),
  });

  const publicVolsegs = publicVolsegQuery.data ?? [];
  const userVolsegs = privateVolsegQuery.data ?? [];

  const userVolsegIds = new Set(userVolsegs.map((v) => v.id));

  const combinedVolsegs = [
    ...userVolsegs.map((v) => ({ ...v, scope: "My" })),
    ...publicVolsegs
      .filter((v) => !userVolsegIds.has(v.id))
      .map((v) => ({ ...v, scope: "Public" })),
  ];

  const mutation = useMutation({
    ...entriesCreateEntryMutation(),
    onSuccess: (entry: EntriesCreateEntryResponse) => {
      toast.success(`Entry "${entry.name}" created successfully`);
      navigate(`/entries/${entry.id}`);
    },
    onError: () => {
      toast.error("Failed to create entry.");
    },
  });

  const handleSubmit = (data: EntryCreateRequest) => {
    mutation.mutate({ body: data });
  };

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-semibold mb-6">Create New Entry</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="volseg_entry_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select a Volseg Entry</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select one..." />
                    </SelectTrigger>
                    <SelectContent>
                      {combinedVolsegs.map((volseg) => (
                        <SelectItem key={volseg.id} value={volseg.id}>
                          [{volseg.scope}] {volseg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Entry name" {...field} />
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
                  <Textarea
                    placeholder="Describe this entry (Markdown supported)"
                    className="min-h-32"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Make entry public</FormLabel>
                  <FormDescription>
                    When enabled, this entry will be visible to everyone.
                    Otherwise, it will only be accessible via a private link.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {mutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {mutation.error.detail ? (
                  Array.isArray(mutation.error.detail) ? (
                    mutation.error.detail.map((error, index) => (
                      <div key={index}>{error.msg}</div>
                    ))
                  ) : (
                    <div>{mutation.error.detail}</div>
                  )
                ) : (
                  <div>An unknown error occurred</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Entry"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

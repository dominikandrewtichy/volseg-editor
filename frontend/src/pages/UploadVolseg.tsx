import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VolsegUploadEntry, zVolsegUploadEntry } from "@/lib/client";
import { volsegEntriesUploadEntryMutation } from "@/lib/client/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function VolsegUploadForm() {
  const [files, setFiles] = useState<{
    cvsx_file?: File;
  }>({});

  const form = useForm<VolsegUploadEntry>({
    resolver: zodResolver(zVolsegUploadEntry),
    defaultValues: {},
  });

  const mutation = useMutation({
    ...volsegEntriesUploadEntryMutation(),
    onSuccess: () => {
      toast.success(`Data uploaded successfully`);
    },
    onError: () => {
      toast.success(`Error`);
    },
  });

  const handleSubmit = (data: VolsegUploadEntry) => {
    mutation.mutate({
      body: {
        db_name: data.db_name,
        entry_id: data.entry_id,
        is_public: data.is_public,
        annotations: files.annotations!,
        metadata: files.metadata!,
        data: files.data!,
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border shadow-md rounded-2xl">
      <h2 className="text-2xl font-semibold mb-4">Upload Volseg Form</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="db_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DB Name</FormLabel>
                <FormControl>
                  <Input placeholder="emdb" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entry_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry ID</FormLabel>
                <FormControl>
                  <Input placeholder="emd-1832" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="mb-0">Make Public</FormLabel>
              </FormItem>
            )}
          />

          {(["annotations", "metadata", "data"] as const).map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={() => (
                <FormItem>
                  <FormLabel className="capitalize">{fieldName}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFiles((prev) => ({
                            ...prev,
                            [fieldName]: file,
                          }));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

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

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

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
import { zVolsegUploadEntry } from "@/lib/client";
import { volsegEntriesUploadEntryMutation } from "@/lib/client/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function VolsegUploadForm() {
  const [cvsxFile, setCvsxFile] = useState<File | null>(null);

  const formSchema = zVolsegUploadEntry.omit({ cvsx_file: true });
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_public: false,
    },
  });

  const mutation = useMutation({
    ...volsegEntriesUploadEntryMutation(),
    onSuccess: () => {
      toast.success(`Data uploaded successfully`);
      form.reset();
      setCvsxFile(null);
    },
    onError: () => {
      toast.success(`Error`);
    },
  });

  const handleSubmit = (data: FormData) => {
    if (!cvsxFile) {
      // toast.error("Please select a CVSX file.");
      return;
    }

    mutation.mutate({
      body: {
        is_public: data.is_public,
        cvsx_file: cvsxFile,
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
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="mb-0">Make Public</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>CVSX File</FormLabel>
            <FormControl>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setCvsxFile(file || null);
                }}
              />
            </FormControl>
            {!cvsxFile && form.formState.isSubmitted && (
              <p className="text-destructive text-sm font-medium">
                CVSX file is required.
              </p>
            )}
          </FormItem>

          {mutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {/* Improved error display */}
                {mutation.error instanceof Error ? (
                  mutation.error.message
                ) : typeof mutation.error === "object" &&
                  mutation.error !== null &&
                  "detail" in mutation.error ? (
                  Array.isArray((mutation.error as { detail: any }).detail) ? (
                    ((mutation.error as { detail: any }).detail as any[]).map(
                      (error, index) => <div key={index}>{error.msg}</div>,
                    )
                  ) : (
                    <div>{(mutation.error as { detail: any }).detail}</div>
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

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
import { Skeleton } from "@/components/ui/skeleton";
import { useMolstar } from "@/contexts/MolstarProvider";
import { useBehavior } from "@/hooks/useBehavior";
import { zBodyVolsegEntriesUploadEntry } from "@/lib/client";
import { volsegEntriesUploadEntryMutation } from "@/lib/client/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PluginState } from "molstar/lib/commonjs/mol-plugin/state";

const MolstarViewer = lazy(() => import("../components/molstar/MolstarViewer"));

export default function VolsegUploadForm() {
  const { viewer } = useMolstar();
  const isLoading = useBehavior(viewer.state.isLoading);
  const [cvsxFile, setCvsxFile] = useState<File | null>(null);
  const [, setSnapshot] = useState<PluginState.Snapshot | null>(null);

  // zod override
  const zVolsegEntriesUploadEntry = zBodyVolsegEntriesUploadEntry.extend({
    cvsx_file: z
      .custom<File>((val) => val instanceof File, {
        message: "CVSX file is required",
      })
      .refine((file) => file.name.toLowerCase().endsWith(".cvsx"), {
        message: "File must have a .cvsx extension",
      })
      .refine((file) => file.size <= 4 * 1024 * 1024 * 1024, {
        message: "File must be smaller than 1GB",
      })
      .refine((file) => /^[a-zA-Z0-9_\-.]+$/.test(file.name), {
        message: "Filename contains invalid characters",
      }),
  });
  type VolsegEntriesUploadEntry = z.infer<typeof zVolsegEntriesUploadEntry>;

  const form = useForm<VolsegEntriesUploadEntry>({
    resolver: zodResolver(zVolsegEntriesUploadEntry),
    defaultValues: {
      name: "",
      is_public: false,
      cvsx_file: undefined,
    },
  });

  const mutation = useMutation({
    ...volsegEntriesUploadEntryMutation({
      // request validator override
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      requestValidator: async (data: any) => {
        return await zVolsegEntriesUploadEntry.parseAsync(data.body);
      },
    }),
    onSuccess: () => {
      toast.success(`Data uploaded successfully`);
    },
    onError: () => {
      toast.success(`Error`);
    },
  });

  async function onCvsxFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCvsxFile(file);
      console.log("Loadded?");
      const snapshot = await viewer.loadCvsxFile(file);
      setSnapshot(snapshot);
      console.log(snapshot);
      form.setValue("cvsx_file", file, {
        // shouldValidate: true,
      });
    } else {
      await viewer.clear();
    }
  }

  function handleSubmit(data: VolsegEntriesUploadEntry) {
    if (!cvsxFile) {
      toast.error("Please select a CVSX file.");
      return;
    }

    console.log(cvsxFile.type);

    mutation.mutate({
      body: {
        ...data,
        cvsx_file: cvsxFile,
      },
    });
  }

  return (
    <div className="flex flex-col gap-y-5">
      <div className="max-w-xl p-6 border shadow-md rounded-2xl">
        <h2 className="text-2xl font-semibold mb-4">Upload Volseg Form</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry name</FormLabel>
                  <FormControl>
                    <Input placeholder="Entry name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cvsx_file"
              render={() => (
                <FormItem>
                  <FormLabel>CVSX File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".cvsx"
                      onChange={onCvsxFileChange}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* {!cvsxFile && form.formState.isSubmitted && (
                  <p className="text-destructive text-sm font-medium">
                    CVSX file is required.
                  </p>
                )} */}
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
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="mb-0">Make Public</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Array.isArray(
                      (mutation.error as { detail: any }).detail,
                    ) ? (
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
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                className="justify-self-end"
                disabled={mutation.isPending || isLoading}
              >
                {mutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className="grow relative h-[500px] max-w-xl">
        <Suspense fallback={<Skeleton className="size-full" />}>
          <MolstarViewer />
        </Suspense>
      </div>
    </div>
  );
}

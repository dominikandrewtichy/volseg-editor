import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zBodyEntriesUploadCvsx } from "@/lib/client";
import {
  authGetUserQueryKey,
  entriesListUserEntriesQueryKey,
  entriesUploadCvsxMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { formatBytes } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "../ui/alert";
import { Spinner } from "../ui/spinner";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

interface UploadDatasetFormProps {
  setDialogOpen: (open: boolean) => void;
}

export function UploadDatasetForm({ setDialogOpen }: UploadDatasetFormProps) {
  const queryClient = useQueryClient();

  const zUploadDataset = zBodyEntriesUploadCvsx.extend({
    dataset_file: z
      .instanceof(File)
      .refine(
        (file) => file.name.endsWith(".cvsx"),
        "Only .cvsx files are allowed",
      )
      .refine(
        (file) => file.size <= MAX_FILE_SIZE,
        `File size must be less than ${formatBytes(MAX_FILE_SIZE)}`,
      ),
    lattice_to_mesh: z.enum(["true", "false"]).default("true"),
  });
  type UploadDataset = z.infer<typeof zUploadDataset>;

  const uploadDatasetForm = useForm<UploadDataset>({
    // @ts-ignore
    resolver: zodResolver(zUploadDataset),
    defaultValues: {
      lattice_to_mesh: "true",
    },
  });

  const uploadEntryMutation = useMutation({
    ...entriesUploadCvsxMutation({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      requestValidator: async (data: any) => {
        return await zUploadDataset.parseAsync(data.body);
      },
    }),
    onSuccess: async () => {
      toast.success("Uploaded successfully");
      await queryClient.invalidateQueries({
        queryKey: entriesListUserEntriesQueryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: authGetUserQueryKey(),
      });
      uploadDatasetForm.reset();
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  function onSubmit(data: UploadDataset) {
    uploadEntryMutation.mutate({
      body: {
        dataset_file: data.dataset_file,
      },
      query: {
        lattice_to_mesh: data.lattice_to_mesh === "true",
      },
    });
  }

  async function onDatasetFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length < 1) {
      return;
    }
    const datasetFile = e.target.files[0]!;
    uploadDatasetForm.setValue("dataset_file", datasetFile);
  }

  return (
    <Form {...uploadDatasetForm}>
      <form
        // @ts-ignore
        onSubmit={uploadDatasetForm.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          // @ts-ignore
          control={uploadDatasetForm.control}
          name="dataset_file"
          render={() => (
            <FormItem>
              <FormLabel>Dataset File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".cvsx"
                  onChange={onDatasetFileChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          // @ts-ignore
          control={uploadDatasetForm.control}
          name="lattice_to_mesh"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Lattice Transformation</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="true" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Convert to Mesh
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="false" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Keep as Volume
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {uploadEntryMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {uploadEntryMutation.error instanceof Error ? (
                uploadEntryMutation.error.message
              ) : typeof uploadEntryMutation.error === "object" &&
                uploadEntryMutation.error !== null &&
                "detail" in uploadEntryMutation.error ? (
                Array.isArray(
                  (uploadEntryMutation.error as { detail: any }).detail,
                ) ? (
                  (
                    (uploadEntryMutation.error as { detail: any })
                      .detail as any[]
                  ).map((error, index) => <div key={index}>{error.msg}</div>)
                ) : (
                  <div>
                    {(uploadEntryMutation.error as { detail: any }).detail}
                  </div>
                )
              ) : (
                <div>An unknown error occurred</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="submit" disabled={uploadEntryMutation.isPending}>
            {uploadEntryMutation.isPending && <Spinner />}
            {uploadEntryMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

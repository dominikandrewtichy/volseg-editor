import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type CreateApiKeyRequest } from "@/lib/client";
import {
  apiKeysCreateApiKeyMutation,
  apiKeysListApiKeysQueryKey,
} from "@/lib/client/@tanstack/react-query.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, addHours, addMinutes, addMonths, addYears } from "date-fns";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CreateApiKeyDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    expirationType: z.enum(["1y", "custom"]),
    customValue: z.string().optional(),
    customUnit: z
      .enum(["minutes", "hours", "days", "months", "years"])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.expirationType === "custom") {
        const val = parseInt(data.customValue || "0");
        return !isNaN(val) && val > 0;
      }
      return true;
    },
    {
      message: "Duration must be a positive number",
      path: ["customValue"],
    },
  );

export function CreateApiKeyDialog({ open, setOpen }: CreateApiKeyDialogProps) {
  const queryClient = useQueryClient();
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      expirationType: "1y",
      customValue: "1",
      customUnit: "days",
    },
  });

  const expirationType = form.watch("expirationType");

  const createMutation = useMutation({
    ...apiKeysCreateApiKeyMutation(),
    onSuccess: (data) => {
      setCreatedKey(data.key);
      queryClient.invalidateQueries({
        queryKey: apiKeysListApiKeysQueryKey(),
      });
      toast.success("API Key created");
      form.reset({
        name: "",
        expirationType: "1y",
        customValue: "1",
        customUnit: "days",
      });
    },
    onError: () => {
      toast.error("Failed to create API key");
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    let expiresAt: string | null = null;
    const now = new Date();

    if (data.expirationType === "1y") {
      expiresAt = addYears(now, 1).toISOString();
    } else if (data.expirationType === "custom") {
      const value = parseInt(data.customValue || "0");
      switch (data.customUnit) {
        case "minutes":
          expiresAt = addMinutes(now, value).toISOString();
          break;
        case "hours":
          expiresAt = addHours(now, value).toISOString();
          break;
        case "days":
          expiresAt = addDays(now, value).toISOString();
          break;
        case "months":
          expiresAt = addMonths(now, value).toISOString();
          break;
        case "years":
          expiresAt = addYears(now, value).toISOString();
          break;
      }
    }

    const request: CreateApiKeyRequest = {
      name: data.name,
      expires_at: expiresAt,
    };

    createMutation.mutate({
      body: request,
    });
  };

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setCreatedKey(null);
      form.reset({
        name: "",
        expirationType: "1y",
        customValue: "1",
        customUnit: "days",
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {createdKey ? "Save your API Key" : "Create API Key"}
          </DialogTitle>
          <DialogDescription>
            {createdKey
              ? "Please copy your API key now. You won't be able to see it again."
              : "Generate a new API key for accessing the API programmatically."}
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input value={createdKey} readOnly className="font-mono" />
              </div>
              <Button
                type="button"
                size="sm"
                className="px-3"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CI/CD Pipeline" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expirationType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Expiration</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="1y" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            1 year (Default)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="custom" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Custom duration
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {expirationType === "custom" && (
                <div className="flex gap-2 ml-7">
                  <FormField
                    control={form.control}
                    name="customValue"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customUnit"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                            <SelectItem value="years">Years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

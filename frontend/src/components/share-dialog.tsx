import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { EntryResponse } from "@/lib/client";
import {
  entriesListUserEntriesQueryKey,
  shareLinksUpdateShareLinkMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareEntryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  entry: EntryResponse;
}

export function ShareEntryDialog({
  open,
  setOpen,
  entry,
}: ShareEntryDialogProps) {
  const queryClient = useQueryClient();

  const [isActive, setIsActive] = useState(entry.share_link.is_active);
  const [copied, setCopied] = useState(false);

  const updateMutation = useMutation({
    ...shareLinksUpdateShareLinkMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: entriesListUserEntriesQueryKey(),
      });
      toast.success("Share settings updated");
    },
    onError: () => {
      setIsActive(!isActive);
      toast.error("Failed to update share settings");
    },
  });

  if (!entry) return null;

  const shareUrl = `${window.location.origin}/share/${entry.share_link.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy link");
    }
  };

  const handleToggleActive = (checked: boolean) => {
    setIsActive(checked);

    updateMutation.mutate({
      path: { share_link_id: entry.share_link.id },
      body: { is_active: checked },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Entry</DialogTitle>
          <DialogDescription>
            Anyone with this link can view this entry.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" value={shareUrl} readOnly />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy</span>
          </Button>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="public-access" className="text-sm font-medium">
              Public Access
            </Label>
            <span className="text-xs text-muted-foreground">
              {isActive ? "Link is active and accessible" : "Link is disabled"}
            </span>
          </div>

          <Switch
            id="public-access"
            checked={isActive}
            onCheckedChange={handleToggleActive}
            disabled={updateMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  shareLinksUpdateShareLinkMutation,
  shareLinksGetShareLinkOptions,
} from "@/lib/client/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { CopyIcon } from "lucide-react";

interface ShareLinkDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  shareLinkId: string;
}

export function ShareLinkDialog({
  open,
  setOpen,
  shareLinkId,
}: ShareLinkDialogProps) {
  const [isActive, setIsActive] = useState(false);

  const { data, isLoading } = useQuery({
    ...shareLinksGetShareLinkOptions({ path: { share_link_id: shareLinkId } }),
    enabled: open,
  });

  const updateMutation = useMutation({
    ...shareLinksUpdateShareLinkMutation(),
    onSuccess: () => {
      setOpen(false);
    },
  });

  const shareUrl = `${window.location.origin}/share/${shareLinkId}`;

  function onSave() {
    updateMutation.mutate({
      path: { share_link_id: shareLinkId },
      body: {
        is_editable: false,
        is_active: isActive,
      },
    });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  useEffect(() => {
    if (data) {
      setIsActive(data.is_active);
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Link Settings</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-start gap-x-3">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="active">Link is Active</Label>
            </div>

            <Button onClick={onSave} disabled={updateMutation.isPending}>
              Save
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

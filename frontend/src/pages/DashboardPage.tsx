import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";

import {
  type DialogState,
  EntriesDialogManager,
} from "@/components/entries/dialog-manager";
import { EntryList } from "@/components/entries/entry-list";
import { Progress } from "@/components/ui/progress";
import { useTitle } from "@/hooks/use-title";
import type { EntryResponse } from "@/lib/client";
import { authGetUserOptions } from "@/lib/client/@tanstack/react-query.gen";
import { formatBytes } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function DashboardPage() {
  useTitle("Dashboard");

  const [activeDialog, setActiveDialog] = useState<DialogState>({ type: null });

  const { data: user } = useQuery({ ...authGetUserOptions() });

  const handleOpenUpload = () => setActiveDialog({ type: "upload" });
  const handleOpenRename = (entry: EntryResponse) =>
    setActiveDialog({ type: "rename", entry });
  const handleOpenDelete = (entry: EntryResponse) =>
    setActiveDialog({ type: "delete", entry });
  const handleOpenShare = (entry: EntryResponse) =>
    setActiveDialog({ type: "share", entry });
  const handleClose = () => setActiveDialog({ type: null });

  const usage = user?.storage_usage || 0;
  const quota = user?.storage_quota || 1;
  const usagePercent = Math.min((usage / quota) * 100, 100);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] p-6 gap-4">
      <div className="flex justify-end">
        <Button onClick={handleOpenUpload}>
          <UploadIcon className="size-4 mr-2" />
          Upload File
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <EntryList
          onRename={handleOpenRename}
          onDelete={handleOpenDelete}
          onShare={handleOpenShare}
        />
      </div>
      <div className="mt-auto pt-4 border-t w-full">
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Storage Usage</span>
            <span className="text-muted-foreground">
              {user
                ? `${formatBytes(usage)} / ${formatBytes(quota)}`
                : "Loading..."}
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {usagePercent.toFixed(1)}% used
          </p>
        </div>
      </div>
      <EntriesDialogManager state={activeDialog} onClose={handleClose} />{" "}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { type EntryResponse } from "@/lib/client";
import { handleEntriesDownload, handleOpenInMVS } from "@/lib/download";
import { formatBytes } from "@/lib/utils";
import {
  AlertCircleIcon,
  BookOpenIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FileIcon,
  Loader2Icon,
  PencilLineIcon,
  ShareIcon,
  SquareArrowUpRightIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../ui/badge";

interface EntryRowProps {
  entry: EntryResponse;
  onRename: (entry: EntryResponse) => void;
  onDelete: (entry: EntryResponse) => void;
  onShare: (entry: EntryResponse) => void;
}

export function EntryTableRow({
  entry,
  onRename,
  onDelete,
  onShare,
}: EntryRowProps) {
  const navigate = useNavigate();
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  function handleView(entry: EntryResponse) {
    navigate(`/entries/${entry.id}`);
  }

  const isProcessing =
    entry.status === "pending" || entry.status === "processing";
  const isFailed = entry.status === "failed";

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex flex-row items-center gap-x-2">
            <FileIcon className="size-4" />
            {entry.name}
          </div>
        </TableCell>
        <TableCell>
          {isProcessing && (
            <Badge variant="secondary" className="gap-1">
              <Loader2Icon className="h-3 w-3 animate-spin" />
              {entry.status === "pending" ? "Queued" : "Processing"}
            </Badge>
          )}
          {!isProcessing && isFailed && (
            <Badge variant="destructive">Failed</Badge>
          )}
          {!isProcessing && !isFailed && (
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-700 hover:bg-green-500/20 hover:text-green-700 border-0"
            >
              Ready
            </Badge>
          )}
        </TableCell>
        <TableCell>{formatBytes(entry.size_bytes)}</TableCell>
        <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isProcessing}>
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isFailed ? (
                <>
                  <DropdownMenuItem onClick={() => setShowErrorDialog(true)}>
                    <AlertCircleIcon className="size-4" />
                    <span>Show Error</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => handleView(entry)}>
                    <EyeIcon className="size-4" />
                    <span>View</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRename(entry)}>
                    <PencilLineIcon className="size-4" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleEntriesDownload(entry, "mvsx")}
                  >
                    <DownloadIcon className="size-4" />
                    <span>Download MVSX</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleEntriesDownload(entry, "mvstory")}
                  >
                    <BookOpenIcon className="size-4" />
                    <span>Download MVStory</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare(entry)}>
                    <ShareIcon className="size-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleOpenInMVS(entry.share_link.id)}
                  >
                    <SquareArrowUpRightIcon className="size-4" />
                    <span>Open in MolViewStories</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => onDelete(entry)}>
                <Trash2Icon className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="size-5" />
              Processing Failed
            </DialogTitle>
            <DialogDescription>
              The server encountered an error while processing this file.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 p-4 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto">
            {entry.error_message || "Unknown error occurred."}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowErrorDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

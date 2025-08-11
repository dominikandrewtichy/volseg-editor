import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, CameraIcon, CopyIcon } from "lucide-react";
import { ViewResponse } from "@/lib/client";
import { toast } from "sonner";

interface ViewCardActionsProps {
  view: ViewResponse;
  isEditable: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetAsThumbnail: () => void;
}

export function ViewCardActions({
  view,
  isEditable,
  onEdit,
  onDelete,
  onSetAsThumbnail,
}: ViewCardActionsProps) {
  if (!isEditable) {
    return <></>;
  }

  function copyToClipboard() {
    navigator.clipboard
      .writeText(view.id)
      .then(() => {
        toast.success("Copied!");
      })
      .catch((err) => {
        toast.error("Failed to copy!", err);
      });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyToClipboard}>
          <CopyIcon className="mr-2 h-4 w-4" />
          <span>Copy View ID</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        {!view.is_thumbnail && (
          <DropdownMenuItem onClick={onSetAsThumbnail}>
            <CameraIcon size={14} className="mr-2" />
            Set As Thumbnail
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
          <span className="text-red-500">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

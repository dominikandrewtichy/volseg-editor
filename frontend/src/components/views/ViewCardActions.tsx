import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, CameraIcon } from "lucide-react";

interface ViewCardActionsProps {
  isEditable: boolean;
  isThumbnail: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetAsThumbnail: () => void;
}

export function ViewCardActions({
  isEditable,
  isThumbnail,
  onEdit,
  onDelete,
  onSetAsThumbnail,
}: ViewCardActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isEditable && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">Delete</span>
            </DropdownMenuItem>
            {!isThumbnail && (
              <DropdownMenuItem onClick={onSetAsThumbnail}>
                <CameraIcon size={14} className="mr-2" />
                Set As Thumbnail
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

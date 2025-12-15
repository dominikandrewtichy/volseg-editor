import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadDatasetForm } from "./upload-entry-form";

interface UploadEntryDialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export function UploadEntryDialog({ open, setOpen }: UploadEntryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload a .cvsx file to create a new entry.
          </DialogDescription>
        </DialogHeader>
        <UploadDatasetForm setDialogOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

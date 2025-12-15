import type { EntryResponse } from "@/lib/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { UpdateEntryForm } from "./update-entry-form";

interface UpdateEntryDialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  entry: EntryResponse | null;
}

export function UpdateEntryDialog({
  open,
  setOpen,
  entry,
}: UpdateEntryDialogProps) {
  if (!entry) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
        </DialogHeader>
        <UpdateEntryForm entry={entry} setDialogOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

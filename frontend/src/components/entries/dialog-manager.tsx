import type { EntryResponse } from "@/lib/client";
import { ShareEntryDialog } from "../share-dialog";
import { DeleteEntryDialog } from "./delete-entry-dialog";
import { UpdateEntryDialog } from "./update-entry-dialog";
import { UploadEntryDialog } from "./upload-entry-dialog";

export type DialogState =
  | { type: "upload" }
  | { type: "delete"; entry: EntryResponse }
  | { type: "rename"; entry: EntryResponse }
  | { type: "share"; entry: EntryResponse }
  | { type: null };

interface EntriesDialogManagerProps {
  state: DialogState;
  onClose: () => void;
}

export function EntriesDialogManager({
  state,
  onClose,
}: EntriesDialogManagerProps) {
  const isOpen = (type: DialogState["type"]) => state.type === type;

  return (
    <>
      <UploadEntryDialog
        open={isOpen("upload")}
        setOpen={(open) => !open && onClose()}
      />

      {state.type === "rename" && (
        <UpdateEntryDialog
          open={true}
          setOpen={(open) => !open && onClose()}
          entry={state.entry}
        />
      )}

      {state.type === "delete" && (
        <DeleteEntryDialog
          open={true}
          setOpen={(open) => !open && onClose()}
          entry={state.entry}
        />
      )}

      {state.type === "share" && (
        <ShareEntryDialog
          open={true}
          setOpen={(open) => !open && onClose()}
          entry={state.entry}
        />
      )}
    </>
  );
}

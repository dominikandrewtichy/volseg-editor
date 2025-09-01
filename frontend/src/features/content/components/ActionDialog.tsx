import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Editor } from "@tiptap/react";
import { ActionFunctionEntry, getActionFunctions } from "../lib/actionRegistry";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

interface ActionDialogProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActionDialog({
  editor,
  open,
  onOpenChange,
}: ActionDialogProps) {
  const [search, setSearch] = useState<string>("");

  function onClick() {
    editor
      .chain()
      .insertContent({
        type: "reactComponent",
        attrs: { count: 42 },
      })
      .run();
    onOpenChange(false);
  }

  const actions = useMemo(
    () => getActionFunctions().filter((action) => action.id.includes(search)),
    [search],
  );

  useEffect(() => {
    if (open) {
      setSearch("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add action</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ScrollArea className="p-3 border rounded-md overflow-clip">
            <div className="flex flex-col space-y-3">
              {actions.map((action) => (
                <ActionButton action={action} onClick={onClick} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ActionButtonProps {
  action: ActionFunctionEntry;
  onClick: () => void;
}

export function ActionButton({ action, onClick }: ActionButtonProps) {
  return (
    <Button variant="outline" onClick={onClick}>
      {action.id}
    </Button>
  );
}

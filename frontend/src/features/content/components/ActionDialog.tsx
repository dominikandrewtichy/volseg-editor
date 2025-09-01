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
import { ZodError } from "zod";
import { toast } from "sonner";

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
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] =
    useState<ActionFunctionEntry | null>(null);
  const [params, setParams] = useState<any>({});
  const [label, setLabel] = useState("");

  const actions = useMemo(
    () =>
      getActionFunctions().filter((action) =>
        action.id.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedAction(null);
      setParams({});
    }
  }, [open]);

  useEffect(() => {
    if (selectedAction) {
      setLabel(selectedAction.label || "");
    }
  }, [selectedAction]);

  function handleInsert() {
    if (!selectedAction) return;
    try {
      const validated = selectedAction.schema.parse(params);
      editor
        .chain()
        .insertContent({
          type: "reactComponent",
          attrs: {
            actionId: selectedAction.id,
            params: validated,
            label: label || selectedAction.label,
          },
        })
        .run();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ZodError) {
        toast.error(err.errors.map((e) => e.message).join("\n"));
      } else {
        toast.error(err instanceof Error ? err.message : "Unknown error");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Action</DialogTitle>
          <DialogDescription>
            Select an action, fill its parameters, and insert it into the
            editor.
          </DialogDescription>
        </DialogHeader>

        {!selectedAction ? (
          <>
            <Input
              placeholder="Search actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3"
            />
            <ScrollArea className="h-60 border rounded-md p-2">
              <div className="flex flex-col gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setSelectedAction(action);
                      setParams({});
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
            <h3 className="font-semibold mb-2">{selectedAction.label}</h3>

            <div className="mb-3">
              <label className="block text-sm font-medium">Button Label</label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter label for this action button"
              />
            </div>

            {selectedAction.form ? (
              <selectedAction.form params={params} setParams={setParams} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No form defined for this action.
              </p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setSelectedAction(null)}>
                Back
              </Button>
              <Button onClick={handleInsert}>Insert</Button>
            </div>
          </>
        )}
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

import { useState } from "react";
import { ZodError } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getActionFunction } from "../lib/actionRegistry";

export function EditActionDialog({
  actionId,
  params: initialParams,
  label: initialLabel,
  onClose,
  onSave,
}) {
  const action = getActionFunction(actionId);
  const [params, setParams] = useState(initialParams || {});
  const [label, setLabel] = useState(initialLabel || "");

  if (!action) return null;

  function handleSave() {
    try {
      const validated = action.schema.parse(params);
      onSave(validated, label || action.label);
    } catch (err) {
      if (err instanceof ZodError) {
        toast.error(err.errors.map((e) => e.message).join("\n"));
      } else {
        toast.error(err instanceof Error ? err.message : "Unknown error");
      }
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Action</DialogTitle>
        </DialogHeader>

        <div className="mb-3">
          <label className="block text-sm font-medium">Button Label</label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter label"
          />
        </div>

        {action.form ? (
          <action.form params={params} setParams={setParams} />
        ) : (
          <p className="text-sm text-muted-foreground">No form defined.</p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

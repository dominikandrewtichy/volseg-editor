import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getActionFunction } from "../lib/actionRegistry";
import { EditActionDialog } from "./EditActionDialog";

export function Component({ node, updateAttributes }: NodeViewProps) {
  const { actionId, params, label } = node.attrs;
  const [editOpen, setEditOpen] = useState(false);
  const { viewer } = useMolstar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const entry = getActionFunction(actionId);

  async function handleClick() {
    setError(null);
    setLoading(true);

    if (!entry) {
      setError(`Function "${actionId}" not found`);
      setLoading(false);
      return;
    }

    try {
      const validated = entry.schema.parse(params);
      await entry.handler(validated, { viewer });
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Unknown error");
      toast.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <NodeViewWrapper as="span">
      <button
        className="inline-flex items-center gap-x-1 bg-accent rounded-md text-sm px-1 font-mono"
        onClick={handleClick}
        onDoubleClick={() => setEditOpen(true)}
      >
        {loading && <Loader2Icon className="animate-spin h-3 w-3" />}
        {label}
      </button>

      {editOpen && (
        <EditActionDialog
          actionId={actionId}
          params={params}
          label={label}
          onClose={() => setEditOpen(false)}
          onSave={(newParams, newLabel) => {
            updateAttributes({
              params: newParams,
              label: newLabel,
            });
            setEditOpen(false);
          }}
        />
      )}
    </NodeViewWrapper>
  );
}

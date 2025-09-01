import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import { NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import { getActionFunction } from "../lib/actionRegistry";

export function Component({ node }) {
  const { actionId, params, label } = node.attrs;
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
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <NodeViewWrapper as="span">
      <button
        className="inline-flex items-center gap-x-1 bg-accent rounded-md text-sm px-1 font-mono"
        onClick={handleClick}
      >
        {loading ? "Loading..." : label}
      </button>
    </NodeViewWrapper>
  );
}

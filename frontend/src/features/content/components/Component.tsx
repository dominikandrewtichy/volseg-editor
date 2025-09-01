import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import { NodeViewWrapper } from "@tiptap/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getActionFunction } from "../lib/actionRegistry";
import { ZodError } from "zod";
import { Loader2Icon, ZapIcon } from "lucide-react";

export function Component(props) {
  const { viewer } = useMolstar();
  const name = "log";
  const label = "Log";
  const params = "log this";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleClick() {
    setError(null);
    setLoading(true);

    const entry = getActionFunction(name);
    if (!entry) {
      setError(`Function "${name}" is not registered.`);
      setLoading(false);
      return;
    }

    try {
      const validated = entry.schema.parse(params);
      const result = entry.handler(validated, {
        viewer,
      });
      if (result instanceof Promise) {
        await result;
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const msg = err.errors.map((e) => e.message).join("\n");
        setError(msg);
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <NodeViewWrapper as="span">
      <button
        className="inline-flex items-center gap-x-1 bg-accent rounded-md text-sm px-1 font-mono"
        onClick={handleClick}
      >
        {loading && <Loader2Icon className="animate-spin h-4 w-4" />}
        {">"}
        {label}
      </button>
    </NodeViewWrapper>
  );
}

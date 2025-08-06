import { Button } from "@/components/ui/button";
import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import { cn } from "@/lib/utils";
import type { Element } from "hast";
import { Loader2Icon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { getActionFunction } from "../lib/actionRegistry";

export function ActionButton({ node }: { node: Element }) {
  const { viewer } = useMolstar();
  const actions = node.data?.actions ?? [];
  const label = node.data?.label ?? "Run";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setError(null);
    setLoading(true);

    for (const action of actions) {
      const entry = getActionFunction(action.name);
      if (!entry) {
        setError(`Function "${action.name}" is not registered.`);
        setLoading(false);
        return;
      }

      try {
        const validated = entry.schema.parse(action.parameters);
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
    }

    setLoading(false);
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <Button
      variant={!!error ? "destructive" : "secondary"}
      size="sm"
      className={cn(error && "border-red-500")}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2Icon className="animate-spin h-4 w-4" />
      ) : (
        <ZapIcon className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}

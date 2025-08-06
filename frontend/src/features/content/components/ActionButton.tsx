import type { Element } from "hast";
import { getActionFunction } from "../lib/actionRegistry";
import { Button } from "@/components/ui/button";
import { ZodError } from "zod";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2Icon, ZapIcon } from "lucide-react";
import { useMolstar } from "@/features/molstar/hooks/useMolstar";

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
          setError("Unknown error");
          console.error(err);
        }
        setLoading(false);
        return;
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClick}
            className=""
            disabled={loading}
          >
            {loading ? (
              <Loader2Icon className="animate-spin h-4 w-4" />
            ) : (
              <ZapIcon className="h-4 w-4" />
            )}
            {label}
          </Button>
        </TooltipTrigger>
        {/* <TooltipContent>Run action</TooltipContent> */}
      </Tooltip>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm mt-1 whitespace-pre-wrap">
          {error}
        </div>
      )}
    </>
  );
}

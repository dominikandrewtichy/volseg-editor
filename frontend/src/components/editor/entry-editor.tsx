import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMolstar } from "@/hooks/use-molstar";
import type {
  InternalEntryOutput,
  InternalTimeframeOutput,
} from "@/lib/client";
import {
  entriesGetEntryModelQueryKey,
  entriesUpdateEntryModelMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TimeframeGroup } from "./timeframe-group";

interface EntryModelEditorProps {
  entryId: string;
  initialData: InternalEntryOutput;
  readOnly?: boolean;
}

export function EntryModelEditor({
  entryId,
  initialData,
  readOnly = false,
}: EntryModelEditorProps) {
  const queryClient = useQueryClient();
  const { viewer } = useMolstar();

  const updateMutation = useMutation({
    ...entriesUpdateEntryModelMutation(),
    onSuccess: () => {
      toast.success("Model updated successfully");
      queryClient.invalidateQueries({
        queryKey: entriesGetEntryModelQueryKey({ path: { entry_id: entryId } }),
      });
      viewer.load({ entry_id: entryId });
    },
    onError: () => {
      toast.error("Failed to update model");
    },
  });

  const [model, setModel] = useState<InternalEntryOutput>(
    structuredClone(initialData),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState(0);

  const handleUpdates = (updates: { path: string[]; value: any }[]) => {
    setModel((prev: InternalEntryOutput) => {
      const next = structuredClone(prev);

      updates.forEach(({ path, value }) => {
        let current = next;
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          // @ts-expect-error TS7053
          if (current[key] === undefined) return;
          // @ts-expect-error TS7053
          current = current[key];
        }
        const lastKey = path[path.length - 1];
        // @ts-expect-error TS7053
        if (current) current[lastKey] = value;
      });

      return next;
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      path: { entry_id: entryId },
      body: model,
    });
    setIsDirty(false);
  };

  const handleReset = () => {
    setModel(JSON.parse(JSON.stringify(initialData)));
    setIsDirty(false);
  };

  if (!model)
    return (
      <div className="p-4 text-destructive text-sm">No data available.</div>
    );

  const timeframes = model.timeframes || [];
  const currentTf = timeframes[activeTimeframe];

  return (
    <div className="flex flex-col h-full bg-sidebar/30">
      {/* Header Toolbar */}
      <div className="p-4 border-b flex items-center justify-between bg-card/50">
        {timeframes.length > 1 ? (
          <Select
            value={activeTimeframe.toString()}
            onValueChange={(val) => setActiveTimeframe(parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf: InternalTimeframeOutput, i: number) => (
                <SelectItem key={i} value={i.toString()}>
                  Timeframe {tf.timeframe_id ?? i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div></div>
        )}
        {!readOnly && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleReset}
              disabled={!isDirty}
              title="Reset changes"
            >
              <RotateCcw className="size-3.5" />
            </Button>
            <Button
              variant={isDirty ? "default" : "outline"}
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || updateMutation.isPending}
              className="h-7 text-xs px-2 gap-1"
            >
              {updateMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Save className="size-3" />
              )}
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {currentTf ? (
          <TimeframeGroup
            key={activeTimeframe}
            index={activeTimeframe}
            timeframe={currentTf}
            onChange={handleUpdates}
            readOnly={readOnly}
          />
        ) : (
          <div className="text-center text-muted-foreground text-sm py-8">
            No timeframes found in model.
          </div>
        )}
      </div>
    </div>
  );
}

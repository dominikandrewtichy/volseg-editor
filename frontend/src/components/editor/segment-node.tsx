import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Settings2 } from "lucide-react";
import { useState } from "react";
import type { InternalSegment } from "./types";

export function SegmentNode({
  segment,
  path,
  onChange,
  canSetOpacity,
  readOnly = false,
}: {
  segment: InternalSegment & {
    label?: string;
    description?: string;
    tooltip?: string;
  };
  path: string[];
  onChange: (updates: { path: string[]; value: any }[]) => void;
  canSetOpacity: boolean;
  readOnly?: boolean;
}) {
  const [showDescription, setShowDescription] = useState(false);
  const label = segment.label || segment.segment_id.toString();

  const handleRowClick = () => {
    if (segment.description) {
      setShowDescription(!showDescription);
    }
  };

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center justify-between py-1.5 pl-8 pr-2 rounded text-sm group transition-colors",
          !readOnly ? "hover:bg-muted/30" : "",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden flex-1",
            !readOnly && segment.description ? "cursor-pointer" : "",
          )}
          onClick={handleRowClick}
        >
          <div
            className="size-3 rounded-full border shadow-sm shrink-0"
            style={{ backgroundColor: segment.color }}
          />
          <span className="truncate">{label}</span>
        </div>

        {!readOnly && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Settings2 className="size-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" side="right" align="start">
              <div className="space-y-4">
                <div className="space-y-1 border-b pb-2">
                  <h4 className="font-medium leading-none">Segment Settings</h4>
                  <p className="text-xs text-muted-foreground">
                    Configure properties for the viewer.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="label" className="text-xs">
                      Label
                    </Label>
                    <Input
                      id="label"
                      value={segment.label || ""}
                      placeholder={segment.segment_id.toString()}
                      onChange={(e) =>
                        onChange([
                          { path: [...path, "label"], value: e.target.value },
                        ])
                      }
                      className="h-8"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="tooltip" className="text-xs">
                      Tooltip
                    </Label>
                    <textarea
                      id="tooltip"
                      value={segment.tooltip || ""}
                      placeholder="Text shown on hover in viewer"
                      onChange={(e) =>
                        onChange([
                          { path: [...path, "tooltip"], value: e.target.value },
                        ])
                      }
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="description" className="text-xs">
                      Description
                    </Label>
                    <textarea
                      id="description"
                      value={segment.description || ""}
                      placeholder="Detailed description"
                      onChange={(e) =>
                        onChange([
                          {
                            path: [...path, "description"],
                            value: e.target.value,
                          },
                        ])
                      }
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2 pt-2 border-t">
                    <Label>Color</Label>
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="color"
                        value={segment.color}
                        onChange={(e) =>
                          onChange([
                            { path: [...path, "color"], value: e.target.value },
                          ])
                        }
                        className="h-8 w-full cursor-pointer"
                      />
                    </div>
                  </div>

                  {canSetOpacity && (
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label>Opacity</Label>
                      <div className="col-span-2 flex items-center gap-2">
                        <Slider
                          value={[segment.opacity]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(vals) =>
                            onChange([
                              { path: [...path, "opacity"], value: vals[0] },
                            ])
                          }
                          className="flex-1"
                        />
                        <span className="w-8 text-right text-xs font-mono">
                          {segment.opacity.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {showDescription && segment.description && (
        <div className="pl-8 pr-4 pb-2 text-xs text-muted-foreground whitespace-pre-wrap">
          {segment.description}
        </div>
      )}
    </div>
  );
}

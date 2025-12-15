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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

export function VolumeNode({
  volume,
  path,
  onChange,
  readOnly = false,
}: {
  volume: any;
  index: number;
  path: string[];
  onChange: (updates: { path: string[]; value: any }[]) => void;
  readOnly?: boolean;
}) {
  const label = volume.label || volume.channel_id;
  const kind = volume.kind || "isosurface";

  return (
    <div
      className={cn(
        "flex items-center justify-between py-1.5 pl-8 pr-2 rounded text-sm group transition-colors",
        !readOnly ? "hover:bg-muted/30" : "",
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div
          className="size-3 rounded-full border shadow-sm shrink-0"
          style={{ backgroundColor: volume.color }}
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
                <h4 className="font-medium leading-none">Volume Settings</h4>
                <p className="text-xs text-muted-foreground">
                  Configure properties for the viewer.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="vol-label" className="text-xs">
                    Label
                  </Label>
                  <Input
                    id="vol-label"
                    value={volume.label || ""}
                    placeholder={volume.channel_id}
                    onChange={(e) =>
                      onChange([
                        { path: [...path, "label"], value: e.target.value },
                      ])
                    }
                    className="h-8"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="vol-description" className="text-xs">
                    Description
                  </Label>
                  <textarea
                    id="vol-description"
                    value={volume.description || ""}
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
                      value={volume.color}
                      onChange={(e) =>
                        onChange([
                          { path: [...path, "color"], value: e.target.value },
                        ])
                      }
                      className="h-8 w-full cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-2">
                  <Label>Opacity</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <Slider
                      value={[volume.opacity]}
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
                      {volume.opacity.toFixed(2)}
                    </span>
                  </div>
                </div>

                {volume.absolute_isovalue && (
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label>Absolute Isovalue</Label>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        max={1}
                        value={volume.absolute_isovalue}
                        onChange={(e) =>
                          onChange([
                            {
                              path: [...path, "absolute_isovalue"],
                              value: parseFloat(e.target.value),
                            },
                          ])
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                )}

                {volume.relative_isovalue &&
                  volume.absolute_isovalue == null && (
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label>Relative Isovalue</Label>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={volume.relative_isovalue}
                          onChange={(e) =>
                            onChange([
                              {
                                path: [...path, "relative_isovalue"],
                                value: parseFloat(e.target.value),
                              },
                            ])
                          }
                          className="h-8"
                        />
                      </div>
                    </div>
                  )}

                {kind === "isosurface" && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label>Show Faces</Label>
                      <Switch
                        checked={volume.show_faces}
                        onCheckedChange={(c) =>
                          onChange([
                            { path: [...path, "show_faces"], value: c },
                          ])
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Wireframe</Label>
                      <Switch
                        checked={volume.show_wireframe}
                        onCheckedChange={(c) =>
                          onChange([
                            { path: [...path, "show_wireframe"], value: c },
                          ])
                        }
                      />
                    </div>
                  </>
                )}

                {kind === "grid_slice" && (
                  <>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label>Dimension</Label>
                      <Select
                        value={volume.dimension}
                        onValueChange={(v) =>
                          onChange([{ path: [...path, "dimension"], value: v }])
                        }
                      >
                        <SelectTrigger className="col-span-2 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="x">X</SelectItem>
                          <SelectItem value="y">Y</SelectItem>
                          <SelectItem value="z">Z</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label>Index</Label>
                      <Input
                        type="number"
                        value={volume.absolute_index}
                        onChange={(e) =>
                          onChange([
                            {
                              path: [...path, "absolute_index"],
                              value: parseInt(e.target.value),
                            },
                          ])
                        }
                        className="col-span-2 h-8"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

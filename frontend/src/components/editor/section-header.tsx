import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronRight } from "lucide-react";

export function SectionHeader({
  label,
  icon: Icon,
  isExpanded,
  onToggle,
  onColorChange,
  onOpacityChange,
  showOpacity = true,
  readOnly = false,
}: {
  label: string;
  icon: any;
  isExpanded: boolean;
  onToggle: () => void;
  onColorChange: (val: string) => void;
  onOpacityChange?: (val: number) => void;
  showOpacity?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 px-2 bg-muted/40 rounded-md group select-none">
      <div
        className="flex items-center gap-2 cursor-pointer flex-1"
        onClick={onToggle}
      >
        {isExpanded ? (
          <ChevronDown className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground" />
        )}
        <Icon className="size-4 text-primary" />
        <span className="font-medium text-sm">{label}</span>
      </div>
      {!readOnly && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Batch Actions */}
          <div className="flex items-center gap-1 bg-background rounded border px-1 shadow-sm">
            <span className="text-[10px] text-muted-foreground font-mono uppercase mr-1">
              All
            </span>
            <input
              type="color"
              className="size-4 p-0 border-0 rounded cursor-pointer bg-transparent"
              title="Set color for all"
              onChange={(e) => onColorChange(e.target.value)}
            />
            {showOpacity && onOpacityChange && (
              <Popover>
                <PopoverTrigger asChild>
                  <div
                    className="size-4 border rounded-full border-dashed border-foreground/50 cursor-pointer bg-gradient-to-tr from-foreground/20 to-transparent"
                    title="Set opacity for all"
                  />
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4">
                  <div className="space-y-2">
                    <Label>Batch Opacity</Label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(vals) => onOpacityChange(vals[0])}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

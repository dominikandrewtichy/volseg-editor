import { Cuboid } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "./section-header";
import { SegmentNode } from "./segment-node";
import type { InternalSegmentation } from "./types";

export function SegmentationGroup({
  segmentation,
  basePath,
  onChange,
  readOnly = false,
}: {
  segmentation: InternalSegmentation;
  index: number;
  basePath: string[];
  onChange: (updates: { path: string[]; value: any }[]) => void;
  readOnly?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const segments = segmentation.segments || [];
  const canSetOpacity = segmentation.kind !== "geometric";

  const handleBatchColor = (color: string) => {
    const updates = segments.map((_: any, i: number) => ({
      path: [...basePath, "segments", i.toString(), "color"],
      value: color,
    }));
    onChange(updates);
  };

  const handleBatchOpacity = (opacity: number) => {
    if (!canSetOpacity) return;
    const updates = segments.map((_: any, i: number) => ({
      path: [...basePath, "segments", i.toString(), "opacity"],
      value: opacity,
    }));
    onChange(updates);
  };

  return (
    <div className="mb-1">
      <SectionHeader
        label={`${segmentation.segmentation_id} (${segmentation.kind})`}
        icon={Cuboid}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        onColorChange={handleBatchColor}
        onOpacityChange={handleBatchOpacity}
        showOpacity={canSetOpacity}
        readOnly={readOnly}
      />
      {isExpanded && (
        <div className="flex flex-col gap-0.5 mt-1 border-l ml-3 pl-1">
          {segments.map((seg: any, i: number) => (
            <SegmentNode
              key={i}
              segment={seg}
              path={[...basePath, "segments", i.toString()]}
              onChange={onChange}
              canSetOpacity={canSetOpacity}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

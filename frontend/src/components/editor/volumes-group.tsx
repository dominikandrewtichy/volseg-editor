import { Layers } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "./section-header";
import type { InternalVolume } from "./types";
import { VolumeNode } from "./volume-node";

export function VolumesGroup({
  volumes,
  basePath,
  onChange,
  readOnly = false,
}: {
  volumes: InternalVolume[];
  basePath: string[];
  onChange: (updates: { path: string[]; value: any }[]) => void;
  readOnly?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!volumes || volumes.length === 0) return null;

  const handleBatchColor = (color: string) => {
    const updates = volumes.map((_, i) => ({
      path: [...basePath, i.toString(), "color"],
      value: color,
    }));
    onChange(updates);
  };

  const handleBatchOpacity = (opacity: number) => {
    const updates = volumes.map((_, i) => ({
      path: [...basePath, i.toString(), "opacity"],
      value: opacity,
    }));
    onChange(updates);
  };

  return (
    <div className="mb-2">
      <SectionHeader
        label={`Volumes (${volumes.length})`}
        icon={Layers}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        onColorChange={handleBatchColor}
        onOpacityChange={handleBatchOpacity}
        readOnly={readOnly}
      />
      {isExpanded && (
        <div className="flex flex-col gap-0.5 mt-1 border-l ml-3 pl-1">
          {volumes.map((vol, i) => (
            <VolumeNode
              key={i}
              index={i}
              volume={vol}
              path={[...basePath, i.toString()]}
              onChange={onChange}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

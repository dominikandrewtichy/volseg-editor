import type { InternalTimeframeOutput } from "@/lib/client";
import { BoxSelect } from "lucide-react";
import { SegmentationGroup } from "./segmentations-group";
import { VolumesGroup } from "./volumes-group";

export function TimeframeGroup({
  timeframe,
  index,
  onChange,
  readOnly = false,
}: {
  timeframe: InternalTimeframeOutput;
  index: number;
  onChange: (updates: { path: string[]; value: any }[]) => void;
  readOnly?: boolean;
}) {
  const volumes = timeframe.volumes || [];
  const segmentations = timeframe.segmentations || [];

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <BoxSelect className="size-3" />
        Timeframe {timeframe.timeframe_id}
      </div>

      <VolumesGroup
        volumes={volumes}
        basePath={["timeframes", index.toString(), "volumes"]}
        onChange={onChange}
        readOnly={readOnly}
      />

      <div className="space-y-1">
        {segmentations.length > 0 && (
          <div className="px-2 py-1 text-xs text-muted-foreground">
            Segmentations
          </div>
        )}
        {segmentations.map((seg, i: number) => (
          <SegmentationGroup
            key={i}
            index={i}
            segmentation={seg}
            basePath={[
              "timeframes",
              index.toString(),
              "segmentations",
              i.toString(),
            ]}
            onChange={onChange}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

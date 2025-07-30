import { VisibilityBadge } from "@/components/common/VisibilityBadge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import { useBehavior } from "@/features/molstar/hooks/useBehavior";
import { useRequiredParam } from "@/hooks/useRequiredParam";
import { Segment } from "@/lib/client";
import { volsegEntriesGetEntryByIdOptions } from "@/lib/client/@tanstack/react-query.gen";
import { cn, formatDate } from "@/lib/utils";
import { Root as ScrollAreaRoot } from "@radix-ui/react-scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Calendar, RotateCcw } from "lucide-react";
import { lazy, Suspense, useEffect } from "react";

const MolstarViewer = lazy(
  () => import("../../molstar/components/MolstarViewer"),
);

export function VolsegEntryPreviewPage() {
  const entryId = useRequiredParam("entryId");
  const { viewer } = useMolstar();
  const currentSegment = useBehavior(viewer.state.segment);

  const volsegEntryQuery = useQuery({
    ...volsegEntriesGetEntryByIdOptions({
      path: {
        volseg_entry_id: entryId,
      },
    }),
  });

  useEffect(() => {
    viewer.state.volsegEntry.next(entryId);
  }, [entryId, viewer]);

  function handleSegmentView(segment: Segment) {
    viewer.state.segment.next(segment);
  }

  function handleReset() {
    viewer.state.segment.next(undefined);
  }

  return (
    <div className="container py-8">
      <div className="md:col-span-2">
        <div className="flex justify-between items-start mb-4">
          {volsegEntryQuery.data ? (
            <h1 className="text-3xl font-bold">
              {volsegEntryQuery.data.name ?? ""}
            </h1>
          ) : (
            <Skeleton className="h-9 w-64" />
          )}

          {volsegEntryQuery.data ? (
            <VisibilityBadge
              isPublic={volsegEntryQuery.data.is_public ?? false}
            />
          ) : (
            <Skeleton className="h-5 w-14" />
          )}
        </div>

        {volsegEntryQuery.data ? (
          <div className="flex flex-row items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Created on {formatDate(volsegEntryQuery.data?.created_at ?? "")}
          </div>
        ) : (
          <Skeleton className="h-5 w-64" />
        )}
      </div>
      <div className="flex flex-row gap-x-5 mt-6 h-[600px]">
        <div className="flex-1 relative">
          <Suspense fallback={<Skeleton className="size-full" />}>
            <MolstarViewer />
          </Suspense>
        </div>
        {volsegEntryQuery.data?.annotations &&
          volsegEntryQuery.data.annotations.segments.length > 0 && (
            <div className="flex flex-col gap-y-3 h-full">
              <Button
                variant="secondary"
                size="sm"
                className="w-fit"
                onClick={handleReset}
              >
                Reset
                <RotateCcw />
              </Button>
              <SegmentsList
                className="h-full overflow-auto"
                selectedSegment={currentSegment}
                segments={volsegEntryQuery.data.annotations.segments}
                handleSegmentView={handleSegmentView}
              />
            </div>
          )}
      </div>
    </div>
  );
}

export function SegmentsList({
  segments,
  selectedSegment,
  handleSegmentView,
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaRoot> & {
  segments: Array<Segment>;
  selectedSegment: Segment | undefined;
  handleSegmentView: (segment: Segment) => Promise<void> | void;
}) {
  if (segments.length < 1) {
    return null;
  }

  return (
    <ScrollArea
      className={cn("p-2 pr-3 rounded-xl border h-full", className)}
      {...props}
    >
      <div className="space-y-3">
        {segments.map((segment) => (
          <div
            key={segment.segment_id}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl bg-muted/50 border-2",
              selectedSegment === segment && "bg-primary/10 border-primary",
            )}
          >
            <div className="flex-1">
              <div className="font-medium mb-2 text-sm">{segment.name}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Segment ID</span>
                  <div>{segment.segment_id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Segmentation</span>
                  <div>{segment.segmentation_id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Kind</span>
                  <div className="capitalize">{segment.kind}</div>
                </div>
                {segment.time !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Time</span>
                    <div>
                      {Array.isArray(segment.time)
                        ? segment.time.join(", ")
                        : segment.time}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSegmentView(segment)}
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

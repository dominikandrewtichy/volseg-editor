import { VisibilityBadge } from "@/components/common/VisibilityBadge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMolstar } from "@/contexts/MolstarProvider";
import { useRequiredParam } from "@/hooks/useRequiredParam";
import { Segment } from "@/lib/client";
import { volsegEntriesGetEntryByIdOptions } from "@/lib/client/@tanstack/react-query.gen";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Calendar, RotateCcw } from "lucide-react";
import { lazy, Suspense, useEffect } from "react";

const MolstarViewer = lazy(() => import("../components/molstar/MolstarViewer"));

export function VolsegEntryPreviewPage() {
  const entryId = useRequiredParam("entryId");
  const { viewer } = useMolstar();

  const volsegEntryQuery = useQuery({
    ...volsegEntriesGetEntryByIdOptions({
      path: {
        volseg_entry_id: entryId,
      },
    }),
  });

  useEffect(() => {
    viewer.loadVolseg(entryId);
  }, [entryId, viewer]);

  async function handleSegmentView(segment: Segment) {
    await viewer.focusSegment(
      volsegEntryQuery.data?.annotations?.entry_id ?? "",
      segment.segment_id,
      segment.segmentation_id,
    );
  }

  async function handleReset() {
    await viewer.resetSegmentVisibility(
      volsegEntryQuery.data?.annotations?.entry_id ?? "",
    );
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
      <div className="flex flex-row gap-x-5 mt-6">
        <div className="flex-1 relative h-[800px]">
          <Suspense fallback={<Skeleton className="size-full" />}>
            <MolstarViewer />
          </Suspense>
        </div>
        <div className="flex flex-col">
          {volsegEntryQuery.data?.annotations && (
            <div className="">
              <Tabs defaultValue="segments" className="w-[500px] relative">
                <TabsList>
                  <TabsTrigger value="segments">Segments</TabsTrigger>
                  <TabsTrigger value="volumes">Volumes</TabsTrigger>
                </TabsList>
                <Button className="absolute right-2 z-10" onClick={handleReset}>
                  Reset
                  <RotateCcw />
                </Button>

                <TabsContent value="volumes" className="p-2 rounded-xl border">
                  <ScrollArea className="h-[500px] pr-2">
                    <div className="space-y-3">
                      {volsegEntryQuery.data.annotations.volumes.length > 0 ? (
                        volsegEntryQuery.data.annotations.volumes.map(
                          (volume, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border"
                            >
                              <div className="flex-1">
                                <div className="font-medium mb-2 text-sm">
                                  Volume {volume.channelId ?? idx + 1}
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Channel ID
                                    </span>
                                    <div>{volume.channelId ?? "N/A"}</div>
                                  </div>
                                  {/* Add more volume metadata here if available */}
                                </div>
                              </div>
                              {/* <div className="ml-4 shrink-0">
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </div> */}
                            </div>
                          ),
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No volumes available.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="segments" className="p-2 rounded-xl border">
                  <ScrollArea className="h-[740px] pr-2">
                    <div className="space-y-3">
                      {volsegEntryQuery.data.annotations.segments.map(
                        (segment) => (
                          <div
                            key={segment.segment_id}
                            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border"
                          >
                            <div className="flex-1">
                              <div className="font-medium mb-2 text-sm">
                                {segment.name}
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Segment ID
                                  </span>
                                  <div>{segment.segment_id}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Segmentation
                                  </span>
                                  <div>{segment.segmentation_id}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Kind
                                  </span>
                                  <div className="capitalize">
                                    {segment.kind}
                                  </div>
                                </div>
                                {segment.time !== undefined && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Time
                                    </span>
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
                        ),
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

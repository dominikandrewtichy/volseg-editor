import { VisibilityBadge } from "@/components/common/VisibilityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMolstar } from "@/contexts/MolstarProvider";
import { useRequiredParam } from "@/hooks/useRequiredParam";
import { volsegEntriesGetEntryByIdOptions } from "@/lib/client/@tanstack/react-query.gen";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { lazy, Suspense, useEffect } from "react";

const MolstarViewer = lazy(() => import("../components/molstar/MolstarViewer"));

export function VolsegEntryPreview() {
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
    async function loadVolseg() {
      await viewer.clear();
      await viewer.loadVolseg(entryId);
    }
    loadVolseg();
  }, [entryId, viewer]);

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
      <div className="flex-1 relative h-[800px] mt-6">
        <Suspense fallback={<Skeleton className="size-full" />}>
          <MolstarViewer />
        </Suspense>
      </div>
    </div>
  );
}

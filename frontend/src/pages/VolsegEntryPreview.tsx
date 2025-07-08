import { VisibilityBadge } from "@/components/common/VisibilityBadge";
import { useMolstar } from "@/contexts/MolstarProvider";
import { useRequiredParam } from "@/hooks/useRequiredParam";
import { volsegEntriesGetEntryByIdOptions } from "@/lib/client/@tanstack/react-query.gen";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { lazy, useEffect } from "react";

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

  if (volsegEntryQuery.isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-8">Loading entry data...</div>
      </div>
    );
  }

  return (
    <>
      {volsegEntryQuery.data && (
        <div className="container py-8">
          <div className="md:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">
                {volsegEntryQuery.data.name}
              </h1>
              <VisibilityBadge isPublic={volsegEntryQuery.data.is_public} />
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-6">
              <Calendar className="h-4 w-4 mr-2" />
              Created on {formatDate(volsegEntryQuery.data?.created_at)}
            </div>
          </div>
          <div className="flex-1 relative h-[800px]">
            <MolstarViewer />
          </div>
        </div>
      )}
    </>
  );
}

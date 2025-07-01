import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { VisibilityBadge } from "@/components/common/VisibilityBadge";
import { EntryDescription } from "@/components/entries/EntryDescription";
import { MolstarViewer } from "@/components/molstar/MolstarViewer";
import { ShareLinkDialog } from "@/components/share-links/ShareLinkDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ViewCreateDialog } from "@/components/views/ViewCreateDialog";
import { ViewsSidebar } from "@/components/views/ViewSidebar";
import { useAuth } from "@/contexts/AuthProvider";
import { useMolstar } from "@/contexts/MolstarProvider";
import {
  entriesGetEntryByIdOptions,
  entriesGetEntryByIdQueryKey,
  entriesGetEntryShareLinkOptions,
  entriesUpdateEntryMutation,
  volsegEntriesGetEntryByIdOptions,
} from "@/lib/client/@tanstack/react-query.gen";
import { formatDate } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface EntryDetailsPageProps {
  entryId?: string;
  isEditable: boolean;
}

export function EntryDetailsPage({
  entryId: overrideEntryId,
  isEditable = true,
}: EntryDetailsPageProps) {
  const { viewer } = useMolstar();
  const { isAuthenticated } = useAuth();
  const canEdit = isAuthenticated && isEditable;
  const params = useParams();
  const routeEntryId = params["entryId"];
  const entryId = overrideEntryId ?? routeEntryId;
  const queryClient = useQueryClient();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const entryQuery = useQuery({
    ...entriesGetEntryByIdOptions({
      path: {
        entry_id: entryId!,
      },
    }),
    enabled: !!entryId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(entryQuery.data?.name ?? "");
  const [description, setDescription] = useState(
    entryQuery.data?.description ?? "",
  );
  const [isPublic, setIsPublic] = useState(entryQuery.data?.is_public ?? false);

  const volsegMutation = useQuery({
    ...volsegEntriesGetEntryByIdOptions({
      path: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        volseg_entry_id: entryQuery.data?.volseg_entry_id!,
      },
    }),
    enabled: !!entryQuery.data?.volseg_entry_id,
  });

  const shareLinkQuery = useQuery({
    ...entriesGetEntryShareLinkOptions({
      path: {
        entry_id: entryId!,
      },
    }),
  });

  const entryMutation = useMutation({
    ...entriesUpdateEntryMutation(),
    onSuccess: () => {
      toast.success("Entry changes saved.");
      queryClient.invalidateQueries({
        queryKey: entriesGetEntryByIdQueryKey({
          path: {
            entry_id: entryId!,
          },
        }),
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error("Failed to create view: " + error.detail[0].msg);
    },
  });

  useEffect(() => {
    async function loadVolseg() {
      const entryId = volsegMutation.data?.id;
      if (!entryId) return;
      await viewer.clear();
      await viewer.loadVolseg(entryId);
    }
    loadVolseg();
  }, [volsegMutation.data?.id, viewer]);

  if (entryQuery.isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-8">Loading entry data...</div>
      </div>
    );
  }

  if (entryQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {entryQuery.error.message || "Failed to load data"}
        </AlertDescription>
      </Alert>
    );
  }

  function onSave() {
    entryMutation.mutate({
      path: {
        entry_id: entryId!,
      },
      body: {
        name: name,
        description: description,
        is_public: isPublic,
      },
    });
  }

  if (!entryQuery.data) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="md:col-span-2">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                className="text-3xl font-bold border-b border-muted focus:outline-none focus:border-primary px-1 w-auto max-w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <h1 className="text-3xl font-bold border-b border-background">
                {entryQuery.data.name}
              </h1>
            )}

            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Created on {formatDate(entryQuery.data.created_at)}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 ml-4">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="public"
                  checked={isPublic}
                  onCheckedChange={(value) => setIsPublic(!!value)}
                />
                <Label htmlFor="public">Public</Label>
              </div>
            ) : (
              <VisibilityBadge isPublic={entryQuery.data.is_public} />
            )}
            {canEdit && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={onSave}>
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setName(entryQuery.data.name);
                        setDescription(entryQuery.data.description || "");
                        setIsPublic(entryQuery.data.is_public || false);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowShareDialog(true)}
                    >
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setName(entryQuery.data.name);
                        setDescription(entryQuery.data.description || "");
                        setIsPublic(entryQuery.data.is_public || false);
                        setIsEditing(true);
                      }}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <textarea
          className="w-full p-2 border rounded text-sm font-mono mb-8"
          rows={20}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      ) : (
        <EntryDescription description={entryQuery.data.description} />
      )}

      <div className="flex flex-1 overflow-hidden gap-x-3">
        <aside className="overflow-hidden flex flex-col h-[80vh]">
          <ViewsSidebar
            entryId={entryId!}
            isEditable={!!canEdit}
            onSaveView={() => setShowSaveDialog(true)}
          />
        </aside>
        <div className="flex-1 relative">
          <MolstarViewer />
        </div>
      </div>

      {canEdit && (
        <>
          <ViewCreateDialog
            entry={entryQuery.data}
            open={showSaveDialog}
            setOpen={setShowSaveDialog}
          />
        </>
      )}

      <ShareLinkDialog
        open={showShareDialog}
        setOpen={setShowShareDialog}
        shareLinkId={shareLinkQuery.data?.id}
      />
    </div>
  );
}

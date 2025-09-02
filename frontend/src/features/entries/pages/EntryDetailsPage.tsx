import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VisibilityBadge } from "@/components/common/VisibilityBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useBehavior } from "@/features/molstar/hooks/useBehavior";
import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import { ViewCreateDialog } from "@/features/views/components/ViewCreateDialog";
import { ViewsSidebar } from "@/features/views/components/ViewSidebar";
import { SegmentsList } from "@/features/volseg-entries/components/VolsegEntryPreviewPage";
import {
  entriesGetEntryByIdOptions,
  entriesGetEntryByIdQueryKey,
  entriesUpdateEntryMutation,
  volsegEntriesGetEntryByIdOptions,
} from "@/lib/client/@tanstack/react-query.gen";
import { cn, formatDate } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CalendarIcon, Camera, RotateCcw } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";
import { Editor } from "@/features/content/components/Tiptap";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EntryDescription } from "../components/EntryDescription";

const MolstarViewer = lazy(
  () => import("@/features/molstar/components/MolstarViewer"),
);

interface EntryDetailsPageProps {
  entryId?: string;
}

export function EntryDetailsPage({
  entryId: overrideEntryId,
}: EntryDetailsPageProps) {
  const { viewer } = useMolstar();
  const { isAuthenticated: canEdit } = useAuth();
  const params = useParams();
  const routeEntryId = params["entryId"];
  const entryId = overrideEntryId ?? routeEntryId;
  const queryClient = useQueryClient();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const currentSegment = useBehavior(viewer.state.segment);
  const [tab, setTab] = useState<"views" | "segments">("views");

  const {
    data: entry,
    error,
    isLoading,
    isError,
  } = useQuery({
    ...entriesGetEntryByIdOptions({
      path: {
        entry_id: entryId!,
      },
    }),
    enabled: !!entryId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(entry?.name ?? "");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [isPublic, setIsPublic] = useState(entry?.is_public ?? false);

  const volsegMutation = useQuery({
    ...volsegEntriesGetEntryByIdOptions({
      path: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        volseg_entry_id: entry?.volseg_entry_id!,
      },
    }),
    enabled: !!entry?.volseg_entry_id,
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
      toast.error("Failed to create view: " + error.detail![0]!.msg);
    },
  });

  useEffect(() => {
    const entryId = volsegMutation.data?.id;
    viewer.state.volsegEntry.next(entryId);
  }, [volsegMutation.data?.id, viewer]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-8">Loading entry data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || "Failed to load data"}
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

  if (!entry) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="md:col-span-2">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <input
                className="text-2xl font-semibold pb-1 border-b border-muted focus:outline-none focus:border-primary w-auto max-w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <h1 className="text-3xl font-bold border-b border-background">
                {entry.name}
              </h1>
            )}

            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Created on {formatDate(entry.created_at)}
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
              <VisibilityBadge isPublic={entry.is_public} />
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
                        setName(entry.name);
                        setDescription(entry.description || "");
                        setIsPublic(entry.is_public || false);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setName(entry.name);
                        setDescription(entry.description || "");
                        setIsPublic(entry.is_public || false);
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

      <EntryDescription description={entry.description} isEditing={isEditing} />

      <div className="flex flex-row gap-x-3 h-[600px]">
        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as "views" | "segments")}
          className="flex gap-x-3 w-[400px]"
        >
          <div className="flex justify-between items-center">
            <TabsList className="flex">
              <TabsTrigger value="views">Views</TabsTrigger>
              <TabsTrigger value="segments">Segments</TabsTrigger>
            </TabsList>

            <div className="flex gap-2 ml-4">
              {canEdit && tab === "views" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Camera size={16} />
                  Save View
                </Button>
              )}
              {tab === "segments" &&
                volsegMutation.data?.annotations?.segments && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => viewer.state.segment.next(undefined)}
                  >
                    <RotateCcw size={16} />
                    Reset
                  </Button>
                )}
            </div>
          </div>

          <TabsContent value="views" className="h-full overflow-auto">
            <ViewsSidebar
              entryId={entryId!}
              isEditable={!!canEdit}
              onSaveView={() => setShowSaveDialog(true)}
            />
          </TabsContent>

          <TabsContent value="segments" className="h-full overflow-auto">
            {volsegMutation.data?.annotations?.segments ? (
              <SegmentsList
                selectedSegment={currentSegment}
                segments={volsegMutation.data.annotations.segments}
                handleSegmentView={(segment) =>
                  viewer.state.segment.next(segment)
                }
              />
            ) : (
              <div className="text-muted-foreground p-4">
                No segments available
              </div>
            )}
          </TabsContent>
        </Tabs>
        <div className="flex-1 relative">
          <Suspense fallback={<Skeleton className="size-full" />}>
            <MolstarViewer />
          </Suspense>
        </div>
      </div>

      {canEdit && (
        <ViewCreateDialog
          entry={entry}
          open={showSaveDialog}
          setOpen={setShowSaveDialog}
        />
      )}
    </div>
  );
}

export function TabTextArea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      const textarea = textareaRef.current;
      if (!textarea) return;

      e.preventDefault();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const selectedText = value.slice(start, end);
      const isMultiLine = selectedText.includes("\n");

      if (isMultiLine) {
        // Split lines and indent or unindent
        const lines = value.slice(start, end).split("\n");

        let modifiedLines;
        if (e.shiftKey) {
          // Unindent
          modifiedLines = lines.map((line) =>
            line.startsWith("\t")
              ? line.slice(1)
              : line.startsWith("    ")
                ? line.slice(4)
                : line,
          );
        } else {
          // Indent
          modifiedLines = lines.map((line) => "\t" + line);
        }

        const newText = modifiedLines.join("\n");

        // Replace selected lines with modified lines
        textarea.value = value.slice(0, start) + newText + value.slice(end);

        // Adjust new selection range
        const lineDiff = newText.length - selectedText.length;
        textarea.selectionStart = start;
        textarea.selectionEnd = end + lineDiff;
      } else {
        // Single-line or no selection: insert tab
        const tab = "\t";
        textarea.value = value.slice(0, start) + tab + value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + tab.length;
      }
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      onKeyDown={handleKeyDown}
      placeholder="Try typing and tabbing like in a code editor..."
      rows={10}
      className={cn("", className)}
      {...props}
    />
  );
}

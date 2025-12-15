import { handleEntriesDownload, handleOpenInMVS } from "@/lib/download";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpenIcon,
  DownloadIcon,
  FileTextIcon,
  MoreVerticalIcon,
  Settings2Icon,
  SquareArrowUpRightIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EntryModelEditor } from "../components/editor/entry-editor";
import { EntryMetadataPanel } from "../components/entries/entry-metadata-panel";
import Molstar from "../components/molstar";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Spinner } from "../components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { useMolstar } from "../hooks/use-molstar";
import { useRequiredParam } from "../hooks/use-required-param";
import { useTitle } from "../hooks/use-title";
import {
  entriesGetEntryByIdOptions,
  entriesGetEntryModelOptions,
} from "../lib/client/@tanstack/react-query.gen";

export function EntryPage() {
  useTitle("Entry");

  const entryId = useRequiredParam("entryId");
  const { viewer } = useMolstar();
  const [activeTab, setActiveTab] = useState<"info" | "model">("info");

  const { data, isLoading, isSuccess, isError } = useQuery({
    ...entriesGetEntryByIdOptions({
      path: { entry_id: entryId },
    }),
  });

  const {
    data: modelData,
    isLoading: isModelLoading,
    isError: isModelError,
  } = useQuery({
    ...entriesGetEntryModelOptions({
      path: {
        entry_id: entryId,
      },
    }),
  });

  useEffect(() => {
    if (data) {
      viewer.load({
        entry_id: data.id,
      });
    }
  }, [data, viewer]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading entry...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-destructive">
        Entry not found.
      </div>
    );
  }

  if (!isSuccess) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-10rem)] gap-4 overflow-hidden">
      <div className="col-span-1 h-full flex flex-col overflow-hidden rounded-lg border bg-card">
        <div className="p-2 border-b flex justify-between items-center bg-muted/20 px-4">
          <div className="w-8" />

          <ToggleGroup
            type="single"
            value={activeTab}
            onValueChange={(v) => v && setActiveTab(v as "info" | "model")}
          >
            <ToggleGroupItem value="info" size="sm" className="gap-2 px-4">
              <FileTextIcon className="size-3.5" />
              Info
            </ToggleGroupItem>
            <ToggleGroupItem value="model" size="sm" className="gap-2 px-4">
              <Settings2Icon className="size-3.5" />
              Model
            </ToggleGroupItem>
          </ToggleGroup>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVerticalIcon className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleEntriesDownload(data, "mvsx")}
              >
                <DownloadIcon className="size-4 mr-2" />
                Download MVSX
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEntriesDownload(data, "mvstory")}
              >
                <BookOpenIcon className="size-4 mr-2" />
                Download MVStory
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleOpenInMVS(data.share_link.id)}
              >
                <SquareArrowUpRightIcon className="size-4 mr-2" />
                Open in MVS
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === "info" ? (
            <EntryMetadataPanel entry={data} />
          ) : (
            <>
              {isModelLoading && (
                <div className="flex justify-center p-8">
                  <Spinner />
                </div>
              )}
              {isModelError && (
                <div className="p-4 text-destructive text-sm">
                  Failed to load model data.
                </div>
              )}
              {modelData && (
                <EntryModelEditor
                  key={data.id}
                  entryId={data.id}
                  initialData={modelData}
                />
              )}
            </>
          )}
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2 bg-muted/20 rounded-lg overflow-hidden border">
        <Molstar />
      </div>
    </div>
  );
}

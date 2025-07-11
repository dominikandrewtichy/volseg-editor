import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { MarkdownViewer } from "../MarkdownViewer";

interface EntryDescriptionProps {
  description?: string | null | undefined;
}

const COLLAPSED_HEIGHT = 200;
const EXPANDED_HEIGHT = 400;

export function EntryDescription({ description }: EntryDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  return (
    <div className="bg-transparent relative mb-8 p-3 text-card-foreground flex flex-col gap-4 rounded-md border shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 z-10"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Collapse" : "Expand"}
        {expanded ? (
          <ChevronUpIcon className="h-4 w-4 ml-1" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        )}
      </Button>

      <ScrollArea
        className={cn("transition-all duration-300", "pr-4")}
        style={{
          height: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
        }}
      >
        <MarkdownViewer markdown={description} />
      </ScrollArea>
    </div>
  );
}

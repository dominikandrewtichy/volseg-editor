import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { MarkdownViewer } from "../MarkdownViewer";

interface EntryDescriptionProps {
  description?: string | null | undefined;
}

const MAX_HEIGHT = 200;

export function EntryDescription({ description }: EntryDescriptionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(true);

  useEffect(() => {
    if (contentRef.current) {
      const { scrollHeight } = contentRef.current;
      setIsOverflowing(scrollHeight > MAX_HEIGHT);
    }
  }, [description]);

  if (!description) return null;

  return (
    <div className="bg-transparent relative mb-8 p-3 text-card-foreground flex flex-col gap-6 rounded-md border shadow-sm">
      <div className="">
        {isOverflowing && (
          <ExpandButton
            expanded={expanded}
            setExpanded={setExpanded}
            className="absolute top-2 right-2 z-10"
          />
        )}
        <div
          ref={contentRef}
          className="transition-all overflow-hidden max-h-none"
          style={{
            height: expanded
              ? "auto"
              : isOverflowing
                ? `${MAX_HEIGHT}px`
                : "0px",
          }}
        >
          <MarkdownViewer markdown={description} />
        </div>
      </div>
    </div>
  );
}

function ExpandButton({
  className,
  expanded,
  setExpanded,
  ...props
}: React.ComponentProps<"button"> & {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("", className)}
      onClick={() => setExpanded(!expanded)}
      {...props}
    >
      {expanded ? "Collapse" : "Expand"}
      {expanded ? (
        <ChevronUpIcon className="h-4 w-4 transition-transform" />
      ) : (
        <ChevronDownIcon className="h-4 w-4 transition-transform" />
      )}
    </Button>
  );
}

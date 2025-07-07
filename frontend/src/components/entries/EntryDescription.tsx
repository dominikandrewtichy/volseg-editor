import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "../ui/button";

interface EntryDescriptionProps {
  description?: string | null | undefined;
}

const MAX_HEIGHT = 100;

export function EntryDescription({ description }: EntryDescriptionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const { scrollHeight } = contentRef.current;
      setIsOverflowing(scrollHeight > MAX_HEIGHT);
    }
  }, [description]);

  if (!description) return null;

  return (
    <Card className="mb-8 bg-transparent">
      {/* <CardHeader className="flex items-center justify-between">
        <CardTitle>Description</CardTitle>
      </CardHeader> */}

      <CardContent>
        {isOverflowing && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-16"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Expand"}
            {expanded ? (
              <ChevronUpIcon className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 transition-transform" />
            )}
          </Button>
        )}
        <div
          ref={contentRef}
          className="transition-all overflow-hidden max-h-none"
          style={{
            height: expanded ? "auto" : isOverflowing ? `${MAX_HEIGHT}px` : "",
          }}
        >
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

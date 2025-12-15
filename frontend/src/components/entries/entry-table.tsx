import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EntryResponse } from "@/lib/client";
import { cn } from "@/lib/utils"; // Import cn utility
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import type { SortColumn, SortOrder } from "./entry-list";
import { EntryTableRow } from "./entry-table-row";

interface EntryTableProps {
  entries: EntryResponse[];
  onRename: (entry: EntryResponse) => void;
  onDelete: (entry: EntryResponse) => void;
  onShare: (entry: EntryResponse) => void;
  sortBy: SortColumn;
  sortOrder: SortOrder;
  onSort: (column: SortColumn) => void;
}

export function EntryTable({
  entries,
  onRename,
  onDelete,
  onShare,
  sortBy,
  sortOrder,
  onSort,
}: EntryTableProps) {
  const renderHeader = (
    label: string,
    column: SortColumn,
    className?: string,
  ) => (
    <TableHead
      className={cn(
        "cursor-pointer hover:text-foreground hover:bg-muted/50 transition-colors select-none",
        className,
      )}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortBy === column &&
          (sortOrder === "asc" ? (
            <ArrowUpIcon className="size-3" />
          ) : (
            <ArrowDownIcon className="size-3" />
          ))}
      </div>
    </TableHead>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {renderHeader("Filename", "name")}
          {renderHeader("Status", "status", "w-[150px]")}
          {renderHeader("Size", "size_bytes", "w-[120px]")}
          {renderHeader("Created At", "created_at", "w-[220px]")}

          <TableHead className="text-right w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <EntryTableRow
            key={entry.id}
            entry={entry}
            onRename={onRename}
            onDelete={onDelete}
            onShare={onShare}
          />
        ))}
      </TableBody>
    </Table>
  );
}

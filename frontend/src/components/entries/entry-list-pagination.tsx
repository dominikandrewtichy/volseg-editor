import type { PaginatedResponseEntryResponse } from "@/lib/client";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";

interface EntryListPaginationProps {
  pagination: PaginatedResponseEntryResponse;
  handlePageChange: (newPage: number) => void;
}

export function EntryListPagination({
  pagination,
  handlePageChange,
}: EntryListPaginationProps) {
  const { page, total_pages } = pagination;

  const handleNextPage = () => {
    if (page < total_pages) handlePageChange(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) handlePageChange(page - 1);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {page} of {total_pages}
      </div>
      <div className="flex items-center justify-between gap-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={page <= 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={page >= total_pages}
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

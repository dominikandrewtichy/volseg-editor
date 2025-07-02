import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
}: PaginationControlsProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Calculate the range of page numbers to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    // Adjust if we're near the end
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">{totalItems} results</span>
      </div>

      <div className="flex items-center gap-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="size-9 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
            </PaginationItem>

            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Math.max(1, currentPage - 1));
                }}
                disabled={currentPage === 1 || totalPages === 0}
                className="size-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
            </PaginationItem>

            {getPageNumbers().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Math.min(totalPages, currentPage + 1));
                }}
                disabled={currentPage === totalPages || totalPages === 0}
                className="size-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </PaginationItem>

            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="size-9 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center space-x-2">
          <Select
            value={perPage.toString()}
            onValueChange={(value) => onPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-16">
              <SelectValue placeholder={perPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
              <SelectItem value="96">96</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

import type { EntryResponse } from "@/lib/client";
import { entriesListUserEntriesOptions } from "@/lib/client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { EntryListPagination } from "./entry-list-pagination";
import { EntryTable } from "./entry-table";

interface EntryListProps {
  onRename: (entry: EntryResponse) => void;
  onDelete: (entry: EntryResponse) => void;
  onShare: (entry: EntryResponse) => void;
}

export type SortColumn = "name" | "size_bytes" | "created_at" | "status";
export type SortOrder = "asc" | "desc";

export function EntryList({ onRename, onDelete, onShare }: EntryListProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = searchParams.get("page");
  const page = pageParam ? Math.max(1, Number(pageParam) || 1) : 1;

  const sortByParam = searchParams.get("sort_by");
  const sortOrderParam = searchParams.get("sort_order");

  const sortBy: SortColumn = (
    ["name", "size_bytes", "created_at", "status"] as const
  ).includes(sortByParam as SortColumn)
    ? (sortByParam as SortColumn)
    : "created_at";

  const sortOrder: SortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : "desc";

  const { isPending, isLoading, isSuccess, isError, data } = useQuery({
    ...entriesListUserEntriesOptions({
      query: {
        page: page,
        sort_by: sortBy,
        sort_order: sortOrder,
      },
    }),
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.items.some(
        (item) => item.status === "pending" || item.status === "processing",
      );
      return hasProcessing ? 1000 : false;
    },
  });

  function handlePageChange(newPage: number) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  }

  function handleSort(column: SortColumn) {
    const newParams = new URLSearchParams(searchParams);

    if (sortBy === column) {
      newParams.set("sort_order", sortOrder === "asc" ? "desc" : "asc");
    } else {
      newParams.set("sort_by", column);
      newParams.set("sort_order", "desc");
    }

    setSearchParams(newParams);
  }

  if (isPending) {
    return <>Pending</>;
  }

  if (isLoading) {
    return <>Loading</>;
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        Failed to load entries. Please try again later.
      </div>
    );
  }

  if (!isSuccess) {
    return;
  }

  return (
    <div className="flex flex-col min-h-full gap-4">
      <div className="flex-1">
        <EntryTable
          entries={data.items}
          onRename={onRename}
          onDelete={onDelete}
          onShare={onShare}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>

      <div className="mt-auto py-4">
        <EntryListPagination
          pagination={data}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EntryResponse, VolsegEntryResponse } from "@/lib/client";
import {
  authReadUsersMeOptions,
  entriesDeleteEntryMutation,
  meListEntriesForUserOptions,
  meListEntriesForUserQueryKey,
  meListVolsegEntriesForUserOptions,
  meListVolsegEntriesForUserQueryKey,
  volsegEntriesDeleteEntryMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 1;

  const entriesResult = useQuery({
    ...meListEntriesForUserOptions({
      query: {
        page,
        per_page: perPage,
        search_term: search || undefined,
      },
    }),
  });

  const volsegEntriesListUserQuery = useQuery({
    ...meListVolsegEntriesForUserOptions(),
  });

  const userResult = useQuery({
    ...authReadUsersMeOptions(),
  });

  const entryDeleteMutation = useMutation({
    ...entriesDeleteEntryMutation(),
    onSuccess: () => {
      toast.success("Entry deleted");
      queryClient.invalidateQueries({
        queryKey: meListEntriesForUserQueryKey(),
      });
    },
  });

  const volsegEntryDeleteMutation = useMutation({
    ...volsegEntriesDeleteEntryMutation(),
    onSuccess: () => {
      toast.success("Volseg entry deleted");
      queryClient.invalidateQueries({
        queryKey: meListVolsegEntriesForUserQueryKey(),
      });
    },
  });

  function handleDeleteEntry(entry: EntryResponse) {
    entryDeleteMutation.mutate({
      path: {
        entry_id: entry.id,
      },
    });
  }

  function handleDeleteVolsegEntry(volsegEntry: VolsegEntryResponse) {
    volsegEntryDeleteMutation.mutate({
      path: {
        volseg_entry_id: volsegEntry.id,
      },
    });
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <Card>
        <CardContent className="py-4 px-6 space-y-2">
          <h2 className="text-xl font-semibold mb-2">User Info</h2>
          {userResult.isLoading ? (
            <p>Loading user info...</p>
          ) : userResult.data ? (
            <div className="text-sm space-y-1">
              <p>
                <strong>ID:</strong> {userResult.data.id}
              </p>
              <p>
                <strong>Email:</strong> {userResult.data.email}
              </p>
              <p>
                <strong>OpenID:</strong> {userResult.data.openid}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(userResult.data.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-destructive">Failed to load user info.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 px-6">
          <h2 className="text-xl font-semibold mb-4">Your Entries</h2>

          {entriesResult.isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: perPage }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Skeleton className="h-8 w-16 inline-block" />
                      <Skeleton className="h-8 w-8 inline-block" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : entriesResult.isError ? (
            <p className="text-destructive">Failed to load entries.</p>
          ) : entriesResult.data && entriesResult.data.items.length > 0 ? (
            <>{/* render full table with data */}</>
          ) : (
            <p>No entries found.</p>
          )}
          {entriesResult.isError && (
            <p className="text-destructive">Failed to load entries.</p>
          )}

          {entriesResult.data && entriesResult.data.items.length > 0 ? (
            <>
              <div className="mb-4">
                <Input
                  type="search"
                  placeholder="Search entries..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // reset to first page when searching
                  }}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entriesResult.data.items.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.name || "Untitled Entry"}</TableCell>
                      <TableCell>
                        {new Date(entry.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`/entries/${entry.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteEntry(entry)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      isActive={page <= 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm px-4">
                      Page {page} of {entriesResult.data.total_pages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) =>
                          p < entriesResult.data.total_pages ? p + 1 : p,
                        )
                      }
                      isActive={page >= entriesResult.data.total_pages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : (
            !entriesResult.isLoading && <p>No entries found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 px-6">
          <h2 className="text-xl font-semibold mb-4">Your Volseg Entries</h2>

          {volsegEntriesListUserQuery.isLoading && (
            <p>Loading volseg entries...</p>
          )}
          {volsegEntriesListUserQuery.isError && (
            <p className="text-destructive">Failed to load volseg entries.</p>
          )}

          {volsegEntriesListUserQuery.data &&
          volsegEntriesListUserQuery.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volsegEntriesListUserQuery.data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {entry.name || "Untitled Volseg Entry"}
                    </TableCell>
                    <TableCell>
                      {new Date(entry.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/volseg-entries/${entry.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteVolsegEntry(entry)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !volsegEntriesListUserQuery.isLoading && (
              <p>No volseg entries found.</p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

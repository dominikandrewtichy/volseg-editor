import { EntryPreview } from "@/components/entries/EntryPreview";
import { Button } from "@/components/ui/button";
import { EntryResponse, PaginatedResponseEntryResponse } from "@/lib/client";
import { entriesListPublicEntriesOptions } from "@/lib/client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export function HomePage() {
  const navigate = useNavigate();
  const { data, error, isLoading, isSuccess, isError } = useQuery({
    ...entriesListPublicEntriesOptions({
      query: {},
    }),
  });

  const entries = data as PaginatedResponseEntryResponse;

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 mt-16">
        <h1 className="text-4xl md:text-5xl font-bold">CELLIM Viewer</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Visualization platform for volume and segmentation data
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Public entries</h2>
          <Button variant="default" onClick={() => navigate("/entries/new")}>
            Create Entry
          </Button>
        </div>

        {isLoading && (
          <div className="text-center py-12">Loading entries...</div>
        )}
        {isError && (
          <div className="text-center py-12 text-red-500">
            Error loading entries. Please try again.
          </div>
        )}
        {isSuccess && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {entries.items.map((entry) => (
                <EntryPreview key={entry.id} entry={entry} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

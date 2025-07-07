import { useQuery } from "@tanstack/react-query";
import { shareLinksGetShareLinkOptions } from "@/lib/client/@tanstack/react-query.gen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { EntryDetailsPage } from "./EntryDetailsPage";
import { useRequiredParam } from "@/hooks/useRequiredParam";

export default function ShareEntryPage() {
  const share_link_id = useRequiredParam("share_link_id");

  const [, setInitialMode] = useState<"view" | "edit" | null>(null);

  const shareLinkQuery = useQuery({
    ...shareLinksGetShareLinkOptions({
      path: { share_link_id: share_link_id as string },
    }),
    enabled: !!share_link_id,
  });

  useEffect(() => {
    if (shareLinkQuery.data?.is_active) {
      setInitialMode(shareLinkQuery.data.is_editable ? "edit" : "view");
    }
  }, [shareLinkQuery.data]);

  if (shareLinkQuery.isLoading) {
    return <div className="container py-8">Loading shared entry...</div>;
  }

  if (
    shareLinkQuery.isError ||
    !shareLinkQuery.data ||
    !shareLinkQuery.data.is_active
  ) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid or inactive share link</AlertTitle>
          <AlertDescription>
            This share link is no longer active or does not exist.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <EntryDetailsPage entryId={shareLinkQuery.data.entry_id} />;
}

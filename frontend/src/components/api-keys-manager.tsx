import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  apiKeysListApiKeysOptions,
  apiKeysListApiKeysQueryKey,
  apiKeysRevokeApiKeyMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

export function ApiKeysManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: keys, isLoading } = useQuery({
    ...apiKeysListApiKeysOptions(),
  });

  const revokeMutation = useMutation({
    ...apiKeysRevokeApiKeyMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: apiKeysListApiKeysQueryKey(),
      });
      toast.success("API Key revoked");
    },
    onError: () => {
      toast.error("Failed to revoke API key");
    },
  });

  const handleRevoke = (id: string) => {
    revokeMutation.mutate({
      path: { key_id: id },
    });
  };

  const getExpirationText = (expiresAt: string | null) => {
    if (!expiresAt) return "Never";
    const date = new Date(expiresAt);
    if (isPast(date)) {
      return <span className="text-destructive">Expired</span>;
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Manage your personal access tokens for the API.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Create New Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Keys</CardTitle>
          <CardDescription>
            These keys can be used to authenticate with the API using the{" "}
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
              Authorization: Bearer
            </code>{" "}
            header.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : keys && keys.length > 0 ? (
                keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {key.prefix}...
                    </TableCell>
                    <TableCell>
                      {format(new Date(key.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{getExpirationText(key.expires_at)}</TableCell>
                    <TableCell>
                      {key.last_used_at
                        ? format(
                            new Date(key.last_used_at),
                            "MMM d, yyyy HH:mm",
                          )
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke "{key.name}"? This
                              action cannot be undone and any applications using
                              this key will stop working.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevoke(key.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Revoke
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No API keys found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateApiKeyDialog open={isCreateOpen} setOpen={setIsCreateOpen} />
    </div>
  );
}

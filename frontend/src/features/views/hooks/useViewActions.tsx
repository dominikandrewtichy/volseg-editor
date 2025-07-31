import { useMolstar } from "@/features/molstar/hooks/useMolstar";
import { ViewResponse } from "@/lib/client";
import {
  viewsDeleteViewMutation,
  viewsGetViewByIdQueryKey,
  viewsGetViewSnapshotOptions,
  viewsListViewsForEntryQueryKey,
  viewsUpdateViewMutation,
} from "@/lib/client/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useViewActions(view: ViewResponse) {

  return {
    loadView,
    deleteView,
    setAsThumbnail,
  };
}

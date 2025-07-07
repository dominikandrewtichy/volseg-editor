import { Badge } from "../ui/badge";

interface VisibilityBadgeProps {
  isPublic: boolean;
}

export function VisibilityBadge({ isPublic }: VisibilityBadgeProps) {
  return <Badge variant="outline">{isPublic ? "Public" : "Private"}</Badge>;
}

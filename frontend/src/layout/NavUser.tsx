import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { authGetUserOptions } from "@/lib/client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  FileTextIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

export function NavUser() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { data, error, isLoading, isSuccess, isError } = useQuery({
    ...authGetUserOptions(),
  });

  if (isLoading) {
    return;
  }
  if (isError) {
    console.error(error);
    return;
  }
  if (!isSuccess) {
    return;
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((word) => (word[0] ? word[0].toUpperCase() : ""))
      .join("");
  }

  const initials = getInitials(data.name ?? "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="lg">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{data.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {data.email}
            </span>
          </div>
          <ChevronDownIcon className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/dashboard">
              <FileTextIcon className="size-4" />
              My Entries
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <SettingsIcon className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

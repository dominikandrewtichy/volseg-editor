import { ThemeToggle } from "@/components/theme-toggle";
import { LogInIcon, MenuIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { useAuth } from "../hooks/use-auth";
import { cn } from "../lib/utils";
import { NavUser } from "./NavUser";

export function Header() {
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const fullPath = location.state?.from
    ? `${location.pathname}${location.search}${location.hash}`
    : "/dashboard";

  async function handleLogin() {
    login(fullPath);
  }

  const navItems = [
    { href: "/", label: "Home" },
    ...(isAuthenticated ? [{ href: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Desktop Nav */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              VolSeg Editor
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  location.pathname === item.href
                    ? "text-foreground font-medium"
                    : "text-foreground/60",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="-ml-2 h-8 w-8 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <SheetHeader>
                <SheetTitle className="text-left">VolSeg Editor</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-2 py-1 text-lg",
                      location.pathname === item.href
                        ? "font-medium text-foreground"
                        : "text-foreground/60",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="font-bold">
            VolSeg Editor
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <NavUser />
          ) : (
            <Button variant="outline" size="sm" onClick={handleLogin}>
              <LogInIcon className="size-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

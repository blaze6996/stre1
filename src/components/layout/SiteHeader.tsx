import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-6 w-6 rounded-md bg-primary" aria-hidden />
          <span className="text-lg">StreamForge</span>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            Home
          </NavLink>
          <NavLink to="/admin" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            Admin
          </NavLink>
          <ThemeToggle />
          <Button asChild size="sm" variant="default">
            <a href="/admin">Manage</a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;

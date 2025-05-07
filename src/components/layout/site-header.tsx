import Link from "next/link"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/layout/main-nav"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
// import { useAuth } from "@/hooks/use-auth"; // Placeholder for auth
import { User, LogIn } from "lucide-react"; // Placeholder for icons

export function SiteHeader() {
  // const { user, signOut } = useAuth(); // Placeholder
  const user = null; // Placeholder

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggleButton />
            {user ? (
              <>
                <Link href="/dashboard"> {/* Or /chat or appropriate authenticated page */}
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                {/* <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button> */}
              </>
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "px-4"
                )}
              >
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

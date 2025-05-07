
"use client";

import Link from "next/link"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/layout/main-nav"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { useAuth } from "@/providers/auth-provider"; 
import { LogIn, LogOut, LayoutDashboard } from "lucide-react"; 

export function SiteHeader() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center"> {/* Reduced height from h-16 */}
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-1 md:space-x-3"> {/* Reduced space-x */}
          <nav className="flex items-center space-x-1 md:space-x-1"> {/* Reduced space-x */}
            <ThemeToggleButton />
            {!loading && (
              user ? (
                <>
                  <Link href="/chat"> 
                    <Button variant="ghost" size="sm" className="text-sm px-2 md:px-3"> {/* Reduced padding */}
                      <LayoutDashboard className="mr-1 md:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={signOut} className="text-sm px-2 md:px-3">  {/* Reduced padding */}
                     <LogOut className="mr-1 md:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "px-2 md:px-3 text-sm" 
                  )}
                >
                  <LogIn className="mr-1 md:mr-2 h-4 w-4" /> Login
                </Link>
              )
            )}
            {loading && <div className="h-8 w-16 md:w-20 animate-pulse rounded-md bg-muted"></div>}
          </nav>
        </div>
      </div>
    </header>
  )
}


"use client";

import Link from "next/link"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/layout/main-nav"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { useAuth } from "@/providers/auth-provider"; // Using the actual AuthProvider
import { User, LogIn, LogOut, LayoutDashboard } from "lucide-react"; 

export function SiteHeader() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <nav className="flex items-center space-x-1 md:space-x-2">
            <ThemeToggleButton />
            {!loading && (
              user ? (
                <>
                  <Link href="/chat"> 
                    <Button variant="ghost" size="sm" className="text-sm">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={signOut} className="text-sm">
                     <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "px-3 md:px-4 text-sm"
                  )}
                >
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              )
            )}
            {loading && <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>}
          </nav>
        </div>
      </div>
    </header>
  )
}

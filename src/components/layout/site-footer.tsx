
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import Link from "next/link"
// Removed Bot import: import { Bot } from "lucide-react"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("py-4 border-t border-border/20 bg-background", className)}> {/* Adjusted py to py-4 for a bit less vertical space */}
      <div className="container flex flex-col items-center justify-between gap-2 md:flex-row md:h-12"> {/* Adjusted gap to gap-2 */}
        <div className="flex flex-col items-center gap-1 px-4 md:flex-row md:gap-2 md:px-0">
            {/* <Bot className="h-6 w-6 text-primary hidden md:block" /> Removed Bot Icon */}
            <p className="text-center text-xs leading-loose text-muted-foreground md:text-left md:text-sm">
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1 md:gap-x-4">
          {siteConfig.footerNav?.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs text-muted-foreground hover:text-primary transition-colors md:text-sm"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

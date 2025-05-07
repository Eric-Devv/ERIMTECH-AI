
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Bot } from "lucide-react"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("py-6 border-t border-border/20 bg-background", className)}> {/* Reduced py-8 to py-6 */}
      <div className="container flex flex-col items-center justify-between gap-3 md:flex-row md:h-12"> {/* Reduced gap-4 to gap-3 and md:h-16 to md:h-12 */}
        <div className="flex flex-col items-center gap-1 px-4 md:flex-row md:gap-2 md:px-0"> {/* Reduced gap-2 to gap-1 */}
            <Bot className="h-6 w-6 text-primary hidden md:block" /> {/* Slightly smaller icon */}
            <p className="text-center text-xs leading-loose text-muted-foreground md:text-left md:text-sm"> {/* Smaller text */}
              Built by ERIMTECH. © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1 md:gap-x-4"> {/* Reduced gaps */}
          {siteConfig.footerNav?.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs text-muted-foreground hover:text-primary transition-colors md:text-sm" /* Smaller text */
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

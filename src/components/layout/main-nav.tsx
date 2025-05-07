
"use client"

import * as React from "react"
import Link from "next/link"
import type { NavItem } from "@/config/site"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Bot } from "lucide-react" // Example Icon

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-4 md:gap-8">
      <Link href="/" className="flex items-center space-x-2">
        <Bot className="h-8 w-8 text-primary" />
        <span className="inline-block font-orbitron text-xl font-bold">{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <nav className="hidden md:flex gap-4 md:gap-6">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center text-lg font-medium text-foreground/70 hover:text-foreground sm:text-sm",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
      ) : null}
    </div>
  )
}


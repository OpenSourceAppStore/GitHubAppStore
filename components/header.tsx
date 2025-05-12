"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Icons } from "@/components/icons"
import { MobileNav } from "@/components/mobile-nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function Header({ className, ...props }: HeaderProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className={cn("bg-background sticky top-0 z-50 w-full border-b", className)} {...props}>
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-4 flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
        </Link>
        <div className="flex-1 items-center justify-between space-x-2 md:flex">
          <nav className="flex items-center space-x-6 text-sm">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/" ? "text-foreground font-medium" : "text-foreground/60"
              }`}
            >
              首页
            </Link>
            <Link
              href="/apps"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/apps" ? "text-foreground font-medium" : "text-foreground/60"
              }`}
            >
              应用列表
            </Link>
            <Link
              href="/trending"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/trending" ? "text-foreground font-medium" : "text-foreground/60"
              }`}
            >
              热门
            </Link>
            <Link
              href="/submit"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/submit" ? "text-foreground font-medium" : "text-foreground/60"
              }`}
            >
              提交应用
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
        <MobileNav>
          <Link
            href="/"
            className="text-foreground/60 hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            首页
          </Link>
          <Link
            href="/apps"
            className="text-foreground/60 hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            应用列表
          </Link>
          <Link
            href="/trending"
            className="text-foreground/60 hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            热门
          </Link>
          <Link
            href="/submit"
            className="text-foreground/60 hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            提交应用
          </Link>
        </MobileNav>
      </div>
    </header>
  )
}

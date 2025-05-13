"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Icons } from "@/components/icons"
import { MobileNav } from "@/components/mobile-nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function Header({ className, ...props }: HeaderProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  // 监听滚动事件，当页面滚动时添加阴影效果
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 导航链接数据 - 移除了"提交应用"选项
  const navLinks = [
    { href: "/", label: "首页" },
    { href: "/apps", label: "应用列表" },
    { href: "/suggestions", label: "需求建议" },
    { href: "/trending", label: "热门项目" },
  ]

  return (
    <header
      className={cn(
        "bg-background sticky top-0 z-50 w-full border-b transition-shadow duration-200",
        isScrolled && "shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        {/* Logo 部分 */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
          </Link>
        </div>

        {/* 桌面导航 - 中等屏幕以上显示 */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors hover:text-foreground/80 hover:bg-accent",
                pathname === link.href ? "text-foreground font-medium bg-accent/50" : "text-foreground/60",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <ThemeToggle />
          <UserNav />
          <Button variant="ghost" size="icon" asChild className="hidden md:flex">
            <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" title="GitHub 仓库">
              <Github className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">GitHub 仓库</span>
            </a>
          </Button>

          {/* 移动端导航触发器 - 仅在中等屏幕以下显示 */}
          <div className="md:hidden">
            <MobileNav>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center py-3 text-base border-b border-border",
                    pathname === link.href
                      ? "text-foreground font-medium"
                      : "text-foreground/60 hover:text-foreground transition-colors",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center py-3 text-base text-foreground/60 hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub 仓库
              </a>
            </MobileNav>
          </div>
        </div>
      </div>
    </header>
  )
}

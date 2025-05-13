"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Icons } from "./icons"
import { siteConfig } from "@/config/site"

interface MobileNavProps {
  children: React.ReactNode
}

export function MobileNav({ children }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="打开菜单"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">切换菜单</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col pr-0 pt-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center space-x-2">
            <Icons.logo className="h-5 w-5" />
            <span className="font-bold">{siteConfig.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="rounded-full"
            aria-label="关闭菜单"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col space-y-0 px-4 py-2">{children}</div>
        <div className="mt-auto border-t px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">主题</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

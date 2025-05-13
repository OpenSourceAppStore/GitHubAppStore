import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { ApiStatus } from "@/components/api-status"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "开源应用商店",
  description: "发现、分享和评论GitHub上的优质开源项目",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="container mx-auto flex-1">{children}</main>
            <footer className="border-t py-4">
              <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 mx-auto">
                <p className="text-center text-sm text-muted-foreground">
                  &copy; 2024 - {new Date().getFullYear()} 开源应用商店。基于 GitHub API 构建。
                </p>
                {/* 添加API状态组件 */}
                <div className="flex items-center">
                  <ApiStatus />
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

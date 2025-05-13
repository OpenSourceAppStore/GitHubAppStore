"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Package, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
// 从新的服务模块导入
import { getApps } from "@/services/apps-api"

export default function AppsPage() {
  const [category, setCategory] = useState("all")
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { data: session } = useSession()

  // 分类列表
  const categories = [
    { value: "all", label: "所有分类" },
    { value: "前端框架", label: "前端框架" },
    { value: "后端框架", label: "后端框架" },
    { value: "数据库", label: "数据库" },
    { value: "机器学习", label: "机器学习" },
    { value: "开发工具", label: "开发工具" },
    { value: "移动应用", label: "移动应用" },
    { value: "游戏开发", label: "游戏开发" },
    { value: "DevOps", label: "DevOps" },
  ]

  useEffect(() => {
    fetchApps()
  }, [category, session])

  const fetchApps = async (loadMore = false) => {
    if (loadMore && !hasMore) return

    const currentPage = loadMore ? page + 1 : 1

    setLoading(true)
    setError(null)

    try {
      // 只有当category不是"all"时才添加标签过滤
      const labels = category !== "all" ? [category] : []
      // 如果用户已登录，使用其token请求API
      const token = session?.accessToken as string | undefined
      const data = await getApps(currentPage, 12, labels, token)

      if (loadMore) {
        setApps((prev) => [...prev, ...data])
      } else {
        setApps(data)
      }

      setPage(currentPage)
      setHasMore(data.length === 12)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    fetchApps(true)
  }

  // 从 issue 内容中提取仓库 URL
  const extractRepoUrl = (body) => {
    const match = body.match(/\*\*仓库地址\*\*:\s*(https:\/\/github\.com\/[\w-]+\/[\w.-]+)/)
    return match ? match[1] : null
  }

  // 从 issue 内容中提取描述
  const extractDescription = (body) => {
    const sections = body.split("## 描述")
    if (sections.length > 1) {
      const descSection = sections[1].split("##")[0].trim()
      return descSection
    }
    return body.substring(0, 150) + "..."
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            应用列表
          </h1>
          <p className="text-muted-foreground">浏览社区提交的开源应用</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 添加提交应用按钮 */}
          <Button asChild variant="default" className="gap-1">
            <Link href="/submit">
              <Plus className="h-4 w-4" />
              提交应用
            </Link>
          </Button>
        </div>
      </div>

      {loading && apps.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="pb-2">
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-32" />
                </CardFooter>
              </Card>
            ))}
        </div>
      ) : error ? (
        <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
          <p>加载应用失败: {error}</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">暂无应用</h2>
          <p className="text-muted-foreground mb-6">成为第一个提交应用的人吧！</p>
          <Button asChild size="lg">
            <Link href="/submit">
              <Plus className="h-5 w-5 mr-2" />
              提交应用
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => {
              const repoUrl = extractRepoUrl(app.body)
              const description = extractDescription(app.body)

              // 如果无法提取仓库 URL，则跳过
              if (!repoUrl) return null

              // 从 URL 中提取仓库所有者和名称
              const urlParts = repoUrl.split("/")
              const owner = urlParts[urlParts.length - 2]
              const repo = urlParts[urlParts.length - 1]

              return (
                <Card key={app.id} className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">
                      <Link href={`/app/${app.number}`} className="hover:underline">
                        {app.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {owner}/{repo}
                      </a>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <p className="text-sm mb-4 line-clamp-3">{description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {app.labels.map((label) => (
                        <Badge key={label.id} variant="secondary">
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {app.comments}
                      </span>
                    </div>
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? "加载中..." : "加载更多"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* 底部固定的提交应用按钮（仅在移动设备上显示） */}
      <div className="md:hidden fixed bottom-6 right-6 z-10">
        <Button asChild size="lg" className="rounded-full shadow-lg h-14 w-14 p-0">
          <Link href="/submit">
            <Plus className="h-6 w-6" />
            <span className="sr-only">提交应用</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

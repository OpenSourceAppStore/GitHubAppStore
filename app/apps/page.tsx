"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Package, Plus, Star, GitFork, Eye, Calendar } from "lucide-react"
import { useSession } from "next-auth/react"
import matter from "gray-matter"
// 从新的服务模块导入
import { getApps } from "@/services/apps-api"

export default function AppsPage() {
  const [category, setCategory] = useState("all")
  const [apps, setApps] = useState([])
  const [parsedApps, setParsedApps] = useState([])
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

      // 解析每个应用的前置元数据
      const parsedData = data.map((app) => {
        try {
          // 尝试解析前置元数据
          const { data: frontmatter } = matter(app.body)
          return {
            ...app,
            frontmatter,
          }
        } catch (err) {
          console.error("解析前置元数据失败:", err)
          return {
            ...app,
            frontmatter: {},
          }
        }
      })

      if (loadMore) {
        setApps((prev) => [...prev, ...data])
        setParsedApps((prev) => [...prev, ...parsedData])
      } else {
        setApps(data)
        setParsedApps(parsedData)
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
  const extractRepoUrl = (body, frontmatter) => {
    // 优先使用前置元数据中的仓库地址
    if (frontmatter && frontmatter.repo) {
      return frontmatter.repo
    }

    // 如果前置元数据中没有，则尝试从正文中提取
    const match = body.match(/\*\*仓库地址\*\*:\s*(https:\/\/github\.com\/[\w-]+\/[\w.-]+)/)
    return match ? match[1] : null
  }

  // 从 issue 内容中提取描述
  const extractDescription = (body, frontmatter) => {
    // 优先使用前置元数据中的描述
    if (frontmatter && frontmatter.description) {
      return frontmatter.description
    }

    // 如果前置元数据中没有，则尝试从正文中提取
    const sections = body.split("## 描述")
    if (sections.length > 1) {
      const descSection = sections[1].split("##")[0].trim()
      return descSection
    }
    return body.substring(0, 150) + "..."
  }

  // 格式化数字（如星标数、分支数等）
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num
  }

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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

      {loading && parsedApps.length === 0 ? (
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
      ) : parsedApps.length === 0 ? (
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
            {parsedApps.map((app) => {
              const { frontmatter } = app
              const repoUrl = extractRepoUrl(app.body, frontmatter)
              const description = extractDescription(app.body, frontmatter)

              // 如果无法提取仓库 URL，则跳过
              if (!repoUrl) return null

              // 从 URL 中提取仓库所有者和名称
              const urlParts = repoUrl.split("/")
              const owner = urlParts[urlParts.length - 2]
              const repo = urlParts[urlParts.length - 1]

              // 获取应用名称（优先使用前置元数据中的名称，其次使用issue标题）
              const appName = frontmatter.name || app.title

              // 获取分类和标签
              const appCategory = frontmatter.category || null
              const appTags = frontmatter.tags || []

              // 获取GitHub统计数据（如果前置元数据中有的话）
              const stars = frontmatter.stars || 0
              const forks = frontmatter.forks || 0
              const watchers = frontmatter.watchers || 0

              return (
                <Card key={app.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">
                      <Link href={`/app/${app.number}`} className="hover:underline">
                        {appName}
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
                      {appCategory && (
                        <Badge variant="default" className="bg-primary">
                          {appCategory}
                        </Badge>
                      )}
                      {Array.isArray(appTags) &&
                        appTags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      {app.labels &&
                        app.labels.map((label) => (
                          <Badge key={label.id} variant="outline">
                            {label.name}
                          </Badge>
                        ))}
                    </div>

                    {/* GitHub 统计信息 */}
                    {(stars > 0 || forks > 0 || watchers > 0) && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        {stars > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {formatNumber(stars)}
                          </span>
                        )}
                        {forks > 0 && (
                          <span className="flex items-center gap-1">
                            <GitFork className="h-4 w-4" />
                            {formatNumber(forks)}
                          </span>
                        )}
                        {watchers > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatNumber(watchers)}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {app.comments}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(app.created_at)}
                    </span>
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

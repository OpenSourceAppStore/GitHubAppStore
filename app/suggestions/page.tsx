"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Lightbulb, ThumbsUp } from "lucide-react"
import { useSession } from "next-auth/react"
import { getSuggestions } from "@/services/suggestions-api"

export default function SuggestionsPage() {
  const [type, setType] = useState("all")
  const [priority, setPriority] = useState("all")
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { data: session } = useSession()

  // 类型列表
  const types = [
    { value: "all", label: "所有类型" },
    { value: "功能请求", label: "功能请求" },
    { value: "改进建议", label: "改进建议" },
    { value: "用户体验", label: "用户体验" },
    { value: "性能优化", label: "性能优化" },
    { value: "其他", label: "其他" },
  ]

  // 优先级列表
  const priorities = [
    { value: "all", label: "所有优先级" },
    { value: "高", label: "高优先级" },
    { value: "中", label: "中优先级" },
    { value: "低", label: "低优先级" },
  ]

  useEffect(() => {
    fetchSuggestions()
  }, [type, priority, session])

  const fetchSuggestions = async (loadMore = false) => {
    if (loadMore && !hasMore) return

    const currentPage = loadMore ? page + 1 : 1

    setLoading(true)
    setError(null)

    try {
      // 准备标签过滤
      const labels = ["suggestion"]
      if (type !== "all") labels.push(type)
      if (priority !== "all") labels.push(priority)

      // 如果用户已登录，使用其token请求API
      const token = session?.accessToken as string | undefined
      const data = await getSuggestions(currentPage, 12, token)

      if (loadMore) {
        setSuggestions((prev) => [...prev, ...data])
      } else {
        setSuggestions(data)
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
    fetchSuggestions(true)
  }

  // 从 issue 内容中提取类型
  const extractType = (body) => {
    const match = body.match(/\*\*类型\*\*:\s*(.+)/)
    return match ? match[1] : "未指定"
  }

  // 从 issue 内容中提取优先级
  const extractPriority = (body) => {
    const match = body.match(/\*\*优先级\*\*:\s*(.+)/)
    return match ? match[1] : "未指定"
  }

  // 从 issue 内容中提取描述
  const extractDescription = (body) => {
    const sections = body.split("## 详细描述")
    if (sections.length > 1) {
      const descSection = sections[1].split("##")[0].trim()
      return descSection
    }
    return body.substring(0, 150) + "..."
  }

  // 获取优先级对应的样式
  const getPriorityBadgeStyle = (priority) => {
    switch (priority.toLowerCase()) {
      case "高":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "中":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "低":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      default:
        return ""
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-8 w-8" />
            需求建议
          </h1>
          <p className="text-muted-foreground">浏览和提交对应用商店的功能需求和改进建议</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="选择优先级" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/suggestions/submit">提交建议</Link>
          </Button>
        </div>
      </div>

      {loading && suggestions.length === 0 ? (
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
          <p>加载需求建议失败: {error}</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">暂无需求建议</h2>
          <p className="text-muted-foreground mb-6">成为第一个提交需求建议的人吧！</p>
          <Button asChild>
            <Link href="/suggestions/submit">提交建议</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => {
              const type = extractType(suggestion.body)
              const priority = extractPriority(suggestion.body)
              const description = extractDescription(suggestion.body)
              const priorityStyle = getPriorityBadgeStyle(priority)

              return (
                <Card key={suggestion.id} className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">
                      <Link href={`/suggestions/${suggestion.number}`} className="hover:underline">
                        {suggestion.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      由 {suggestion.user.login} 提交于 {new Date(suggestion.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <p className="text-sm mb-4 line-clamp-3">{description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{type}</Badge>
                      <Badge variant="outline" className={priorityStyle}>
                        {priority}优先级
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {suggestion.comments}
                      </span>
                      {suggestion.reactions && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {suggestion.reactions["+1"] || 0}
                        </span>
                      )}
                    </div>
                    <span>
                      {suggestion.labels
                        .filter(
                          (label) => label.name !== "suggestion" && label.name !== type && label.name !== priority,
                        )
                        .map((label) => label.name)
                        .join(", ")}
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
    </div>
  )
}

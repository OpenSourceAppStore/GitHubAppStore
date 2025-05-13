"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, GitFork, Eye, TrendingUp, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
// 从新的服务模块导入
import { getTrendingRepositories } from "@/services/trending-api"

export default function TrendingPage() {
  const [period, setPeriod] = useState("daily")
  const [language, setLanguage] = useState("all")
  const [sortBy, setSortBy] = useState("stars")
  const [sortOrder, setSortOrder] = useState("desc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(30)
  const [totalCount, setTotalCount] = useState(0)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true)
      setError(null)

      try {
        const languageParam = language !== "all" ? language : ""
        // 如果用户已登录，使用其token请求API
        const token = session?.accessToken as string | undefined
        const data = await getTrendingRepositories(languageParam, period, sortBy, sortOrder, page, perPage, token)
        setRepos(data.items || [])
        setTotalCount(data.total_count || 0)
      } catch (err) {
        setError(err.message)
        setRepos([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [period, language, sortBy, sortOrder, page, perPage, session])

  // 其余代码保持不变...

  // 计算总页数
  const totalPages = Math.ceil(totalCount / perPage)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePerPageChange = (value) => {
    setPerPage(Number(value))
    setPage(1)
  }

  const periods = [
    { value: "daily", label: "今日" },
    { value: "weekly", label: "本周" },
    { value: "monthly", label: "本月" },
    { value: "quarterly", label: "本季度" },
    { value: "yearly", label: "今年" },
  ]

  const languages = [
    { value: "all", label: "所有语言" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "dart", label: "Dart" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "shell", label: "Shell" },
  ]

  const sortOptions = [
    { value: "stars", label: "星标数" },
    { value: "forks", label: "分支数" },
    { value: "updated", label: "最近更新" },
    { value: "created", label: "创建时间" },
    { value: "pushed", label: "推送时间" },
    { value: "help-wanted-issues", label: "需要帮助的问题" },
  ]

  const orderOptions = [
    { value: "desc", label: "降序" },
    { value: "asc", label: "升序" },
  ]

  const perPageOptions = [
    { value: "30", label: "30条/页" },
    { value: "60", label: "60条/页" },
    { value: "100", label: "100条/页" },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            热门项目
          </h1>
          <p className="text-muted-foreground">发现 GitHub 上最受欢迎的开源项目</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">时间段</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="时间段" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">编程语言</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="编程语言" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">排序方式</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">排序顺序</label>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="排序顺序" />
              </SelectTrigger>
              <SelectContent>
                {orderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(perPage > 12 ? 12 : perPage)
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
          <p>加载热门项目失败: {error}</p>
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">未找到热门项目</h2>
          <p className="text-muted-foreground">尝试更改筛选条件</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <Card key={repo.id} className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-1">
                    {/* 修改为直接链接到GitHub仓库 */}
                    <a
                      href={`https://github.com/${repo.owner.login}/${repo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center"
                    >
                     {repo.owner.login}/{repo.name}
                      <ExternalLink className="h-4 w-4 ml-1 inline-block" />
                    </a>
                  </CardTitle>
                  <CardDescription>
                    <a
                      href={`https://github.com/${repo.owner.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {repo.owner.login}
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <p className="text-sm mb-4 line-clamp-2">{repo.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {repo.topics &&
                      repo.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {repo.stargazers_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {repo.forks_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {repo.watchers_count.toLocaleString()}
                    </span>
                  </div>
                  {repo.language && <span>{repo.language}</span>}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
              {/* 左侧：总项目数和总页数信息 */}
              <div className="text-sm text-muted-foreground">
                共 {totalCount.toLocaleString()} 个项目，当前第 {page} 页，共 {totalPages} 页
              </div>

              {/* 中间：页码按钮 */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // 显示当前页附近的页码
                    let pageNum
                    if (totalPages <= 5) {
                      // 如果总页数小于等于5，直接显示所有页码
                      pageNum = i + 1
                    } else if (page <= 3) {
                      // 如果当前页靠近开始，显示前5页
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      // 如果当前页靠近结束，显示后5页
                      pageNum = totalPages - 4 + i
                    } else {
                      // 否则显示当前页及其前后各2页
                      pageNum = page - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-9 h-9"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* 右侧：每页显示选择器 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">每页显示:</span>
                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="每页数量" />
                  </SelectTrigger>
                  <SelectContent>
                    {perPageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, GitFork, Eye, TrendingUp } from "lucide-react"
import { getTrendingRepositories } from "@/lib/github-api"

export default function TrendingPage() {
  const [period, setPeriod] = useState("daily")
  const [language, setLanguage] = useState("all")
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true)
      setError(null)

      try {
        // 只有当language不是"all"时才传递语言参数
        const languageParam = language !== "all" ? language : ""
        const data = await getTrendingRepositories(languageParam, period)
        setRepos(data.items || [])
      } catch (err) {
        setError(err.message)
        setRepos([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [period, language])

  const languages = [
    { value: "all", label: "所有语言" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "cpp", label: "C++" },
    { value: "php", label: "PHP" },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            热门项目
          </h1>
          <p className="text-muted-foreground">发现 GitHub 上最受欢迎的开源项目</p>
        </div>

        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="时间段" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">今日</SelectItem>
              <SelectItem value="weekly">本周</SelectItem>
              <SelectItem value="monthly">本月</SelectItem>
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[150px]">
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
      </div>

      {loading ? (
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
          <p>加载热门项目失败: {error}</p>
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">未找到热门项目</h2>
          <p className="text-muted-foreground">尝试更改筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
            <Card key={repo.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">
                  <Link href={`/app/${repo.owner.login}/${repo.name}`} className="hover:underline">
                    {repo.name}
                  </Link>
                </CardTitle>
                <CardDescription>{repo.owner.login}</CardDescription>
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
      )}
    </div>
  )
}

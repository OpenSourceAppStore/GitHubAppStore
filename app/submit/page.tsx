"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Github } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
// 从新的服务模块导入
import { submitApp } from "@/services/apps-api"

// 应用分类
const categories = [
  { value: "前端框架", label: "前端框架" },
  { value: "后端框架", label: "后端框架" },
  { value: "数据库", label: "数据库" },
  { value: "机器学习", label: "机器学习" },
  { value: "开发工具", label: "开发工具" },
  { value: "移动应用", label: "移动应用" },
  { value: "游戏开发", label: "游戏开发" },
  { value: "DevOps", label: "DevOps" },
  { value: "安全工具", label: "安全工具" },
  { value: "数据可视化", label: "数据可视化" },
  { value: "API工具", label: "API工具" },
  { value: "区块链", label: "区块链" },
]

export default function SubmitPage() {
  const [repoUrl, setRepoUrl] = useState("")
  const [appName, setAppName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const router = useRouter()

  // 检查用户是否已登录，如果未登录则重定向到登录页面
  useEffect(() => {
    if (status === "unauthenticated") {
      // 重定向到登录页面，并设置回调URL为当前页面
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/submit")}`)
    }
  }, [status, router])

  // 如果正在加载会话状态，显示加载中
  if (status === "loading") {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 如果未登录，不渲染页面内容（虽然会被重定向，但为了安全起见）
  if (!session) {
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 表单验证
    if (!repoUrl.trim()) {
      toast({
        title: "请输入仓库 URL",
        description: "GitHub 仓库 URL 是必填项",
        variant: "destructive",
      })
      return
    }

    if (!appName.trim()) {
      toast({
        title: "请输入应用名称",
        description: "应用名称是必填项",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "请选择应用分类",
        description: "应用分类是必填项",
        variant: "destructive",
      })
      return
    }

    // 验证 GitHub 仓库 URL 格式
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/
    if (!githubUrlPattern.test(repoUrl)) {
      toast({
        title: "无效的 GitHub 仓库 URL",
        description: "请输入有效的 GitHub 仓库 URL，例如 https://github.com/username/repo",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 准备标签数组
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      // 提交应用（创建 issue）
      await submitApp(
        {
          title: appName,
          repoUrl,
          description,
          category,
          tags: tagArray,
        },
        session.accessToken as string,
      )

      toast({
        title: "提交成功",
        description: "您的应用已成功提交，等待审核",
      })

      // 重置表单
      setRepoUrl("")
      setAppName("")
      setDescription("")
      setCategory("")
      setTags("")
    } catch (error) {
      toast({
        title: "提交失败",
        description: error.message || "提交应用时出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">提交应用</h1>

        <Card>
          <CardHeader>
            <CardTitle>提交 GitHub 项目</CardTitle>
            <CardDescription>分享您喜爱的开源项目，让更多人发现它</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="repo-url">GitHub 仓库 URL</Label>
                <Input
                  id="repo-url"
                  placeholder="https://github.com/username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">输入完整的 GitHub 仓库 URL</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-name">应用名称</Label>
                <Input
                  id="app-name"
                  placeholder="应用名称"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">应用分类</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">标签（用逗号分隔）</Label>
                <Input
                  id="tags"
                  placeholder="react, ui, 组件库"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">添加相关标签，用逗号分隔</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">应用描述</Label>
                <Textarea
                  id="description"
                  placeholder="请简要描述这个项目..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="bg-muted p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">提交说明</p>
                  <p>
                    提交的项目将作为 issue 创建在 OpenSourceAppStore/NotGitHubAppStore
                    仓库中，管理员审核后将添加到应用商店。
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  提交中...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4 mr-2" />
                  提交应用
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

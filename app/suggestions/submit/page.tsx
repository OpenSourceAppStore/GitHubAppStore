"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { submitSuggestion } from "@/services/suggestions-api"

export default function SubmitSuggestionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [priority, setPriority] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const router = useRouter()

  // 类型列表
  const types = [
    { value: "功能请求", label: "功能请求" },
    { value: "改进建议", label: "改进建议" },
    { value: "用户体验", label: "用户体验" },
    { value: "性能优化", label: "性能优化" },
    { value: "其他", label: "其他" },
  ]

  // 优先级列表
  const priorities = [
    { value: "高", label: "高优先级" },
    { value: "中", label: "中优先级" },
    { value: "低", label: "低优先级" },
  ]

  // 检查用户是否已登录，如果未登录则重定向到登录页面
  useEffect(() => {
    if (status === "unauthenticated") {
      // 重定向到登录页面，并设置回调URL为当前页面
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/suggestions/submit")}`)
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
    if (!title.trim()) {
      toast({
        title: "请输入标题",
        description: "需求建议标题是必填项",
        variant: "destructive",
      })
      return
    }

    if (!type) {
      toast({
        title: "请选择类型",
        description: "需求建议类型是必填项",
        variant: "destructive",
      })
      return
    }

    if (!priority) {
      toast({
        title: "请选择优先级",
        description: "需求建议优先级是必填项",
        variant: "destructive",
      })
      return
    }

    if (!description.trim()) {
      toast({
        title: "请输入详细描述",
        description: "需求建议详细描述是必填项",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 提交需求建议（创建 issue）
      await submitSuggestion(
        {
          title,
          description,
          type,
          priority,
        },
        session.accessToken as string,
      )

      toast({
        title: "提交成功",
        description: "您的需求建议已成功提交",
      })

      // 重定向到需求建议列表页面
      router.push("/suggestions")
    } catch (error) {
      toast({
        title: "提交失败",
        description: error.message || "提交需求建议时出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Lightbulb className="h-8 w-8" />
          提交需求建议
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>提交您的想法</CardTitle>
            <CardDescription>分享您对应用商店的功能需求和改进建议</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  placeholder="简洁明了的标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">类型</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">详细描述</Label>
                <Textarea
                  id="description"
                  placeholder="请详细描述您的需求或建议..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="bg-muted p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">提交说明</p>
                  <p>
                    您的需求建议将作为 issue 创建在 OpenSourceAppStore/NotGitHubAppStore
                    仓库中，其他用户可以查看和评论。请确保描述清晰，以便开发者更好地理解您的需求。
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
                  <Lightbulb className="h-4 w-4 mr-2" />
                  提交建议
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

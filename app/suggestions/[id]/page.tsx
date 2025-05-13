"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Share2, AlertCircle, Lightbulb, ThumbsUp, ThumbsDown, Calendar, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import {
  getSuggestionDetails,
  getSuggestionComments,
  addSuggestionComment,
  voteSuggestion,
} from "@/services/suggestions-api"

export default function SuggestionPage({ params }) {
  const { id } = params
  const [suggestion, setSuggestion] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comment, setComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [votingUp, setVotingUp] = useState(false)
  const [votingDown, setVotingDown] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    fetchSuggestionDetails()
  }, [id])

  const fetchSuggestionDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // 获取用户token（如果已登录）
      const token = session?.accessToken as string | undefined

      // 获取需求建议详情（issue）
      const suggestionData = await getSuggestionDetails(Number.parseInt(id), token)
      setSuggestion(suggestionData)

      // 获取需求建议评论
      const commentsData = await getSuggestionComments(Number.parseInt(id), token)
      setComments(commentsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 从 issue 内容中提取类型
  const extractType = (body) => {
    const match = body?.match(/\*\*类型\*\*:\s*(.+)/)
    return match ? match[1] : "未指定"
  }

  // 从 issue 内容中提取优先级
  const extractPriority = (body) => {
    const match = body?.match(/\*\*优先级\*\*:\s*(.+)/)
    return match ? match[1] : "未指定"
  }

  // 从 issue 内容中提取描述
  const extractDescription = (body) => {
    const sections = body?.split("## 详细描述")
    if (sections && sections.length > 1) {
      const descSection = sections[1].split("##")[0].trim()
      return descSection
    }
    return ""
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: suggestion?.title || "需求建议",
        text: extractDescription(suggestion?.body || "") || "查看这个需求建议",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "链接已复制",
        description: "需求建议链接已复制到剪贴板",
      })
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()

    if (!comment.trim()) {
      toast({
        title: "评论不能为空",
        description: "请输入评论内容",
        variant: "destructive",
      })
      return
    }

    setSubmittingComment(true)

    try {
      // 检查用户是否已登录
      if (!session?.accessToken) {
        toast({
          title: "需要登录",
          description: "请先登录 GitHub 后再发表评论",
        })
        setSubmittingComment(false)
        return
      }

      // 提交评论
      await addSuggestionComment(Number.parseInt(id), comment, session.accessToken as string)

      toast({
        title: "评论成功",
        description: "您的评论已成功发布",
      })

      // 重新获取评论
      const token = session?.accessToken as string | undefined
      const commentsData = await getSuggestionComments(Number.parseInt(id), token)
      setComments(commentsData)

      // 清空评论框
      setComment("")
    } catch (error) {
      toast({
        title: "评论失败",
        description: error.message || "发表评论时出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleVote = async (reaction) => {
    try {
      // 检查用户是否已登录
      if (!session?.accessToken) {
        toast({
          title: "需要登录",
          description: "请先登录 GitHub 后再投票",
        })
        return
      }

      if (reaction === "+1") {
        setVotingUp(true)
      } else {
        setVotingDown(true)
      }

      // 提交投票
      await voteSuggestion(Number.parseInt(id), reaction, session.accessToken as string)

      toast({
        title: "投票成功",
        description: "您的投票已记录",
      })

      // 重新获取需求建议详情以更新投票计数
      const token = session?.accessToken as string | undefined
      const suggestionData = await getSuggestionDetails(Number.parseInt(id), token)
      setSuggestion(suggestionData)
    } catch (error) {
      toast({
        title: "投票失败",
        description: error.message || "投票时出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setVotingUp(false)
      setVotingDown(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <div className="md:w-1/3">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !suggestion) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">获取需求建议失败</h1>
          <p className="text-muted-foreground mb-6">{error || "需求建议不存在或已被删除"}</p>
          <Button asChild>
            <Link href="/suggestions">返回需求建议列表</Link>
          </Button>
        </div>
      </div>
    )
  }

  const type = extractType(suggestion.body)
  const priority = extractPriority(suggestion.body)
  const description = extractDescription(suggestion.body)
  const priorityStyle = getPriorityBadgeStyle(priority)

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Link href="/suggestions" className="hover:underline flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回需求建议列表
              </Link>
            </div>

            <h1 className="text-3xl font-bold mb-2">{suggestion.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">
              由 {suggestion.user.login} 提交于 {new Date(suggestion.created_at).toLocaleDateString()}
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <Button variant="outline" onClick={() => handleVote("+1")} disabled={votingUp}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                支持 {suggestion.reactions?.["+1"] || 0}
              </Button>
              <Button variant="outline" onClick={() => handleVote("-1")} disabled={votingDown}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                反对 {suggestion.reactions?.["-1"] || 0}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="outline">{type}</Badge>
              <Badge variant="outline" className={priorityStyle}>
                {priority}优先级
              </Badge>
              {suggestion.labels
                .filter((label) => label.name !== "suggestion" && label.name !== type && label.name !== priority)
                .map((label) => (
                  <Badge key={label.id} variant="secondary">
                    {label.name}
                  </Badge>
                ))}
            </div>

            <Card className="mb-8">
              <CardContent className="p-6 prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-line">{description}</div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  提交于 {new Date(suggestion.created_at).toLocaleDateString()}
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>评论</CardTitle>
                <CardDescription>分享您对这个需求建议的看法</CardDescription>
              </CardHeader>
              <CardContent>
                {session ? (
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <Textarea
                      placeholder="写下您的评论..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button type="submit" disabled={submittingComment}>
                      {submittingComment ? "发表中..." : "发表评论"}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-muted p-4 rounded-md mb-6">
                    <p className="text-center mb-2">
                      请{" "}
                      <Link href="/auth/signin" className="text-primary hover:underline">
                        登录
                      </Link>{" "}
                      后发表评论
                    </p>
                    <p className="text-xs text-center text-muted-foreground">
                      我们只需要您的邮箱地址用于身份验证，不会请求其他GitHub权限
                    </p>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.avatar_url || "/placeholder.svg"} alt={comment.user.login} />
                            <AvatarFallback>{comment.user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{comment.user.login}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-1 text-sm prose dark:prose-invert max-w-none">
                              <div dangerouslySetInnerHTML={{ __html: comment.body.replace(/\n/g, "<br/>") }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">暂无评论，成为第一个评论的人吧！</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-1/3">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>需求建议信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestion.user && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={suggestion.user.avatar_url || "/placeholder.svg"}
                          alt={suggestion.user.login}
                        />
                        <AvatarFallback>{suggestion.user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{suggestion.user.login}</h4>
                        <a
                          href={suggestion.user.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          查看资料
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">状态</span>
                      <span>{suggestion.state === "open" ? "开放" : "已关闭"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">类型</span>
                      <span>{type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">优先级</span>
                      <span className={priorityStyle ? `px-2 py-0.5 rounded ${priorityStyle}` : ""}>{priority}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">评论数</span>
                      <span>{suggestion.comments}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">支持数</span>
                      <span>{suggestion.reactions?.["+1"] || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">反对数</span>
                      <span>{suggestion.reactions?.["-1"] || 0}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">相关链接</h4>
                    <div className="space-y-2">
                      <a
                        href={suggestion.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm hover:underline"
                      >
                        <Lightbulb className="h-3 w-3 mr-2" />
                        查看原始 Issue
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  GitFork,
  Eye,
  MessageSquare,
  Share2,
  BookmarkPlus,
  ExternalLink,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Code,
  Tag,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import matter from "gray-matter"
import { MarkdownPreview } from "@/components/markdown-editor"

// 从服务模块导入
import { getAppDetails, getAppComments, addComment } from "@/services/app-details-api"
import { getRepository, getReadme } from "@/services/repository-api"

export default function AppPage({ params }) {
  const { id } = params
  const [app, setApp] = useState(null)
  const [appData, setAppData] = useState<any>(null)
  const [comments, setComments] = useState([])
  const [repository, setRepository] = useState(null)
  const [readme, setReadme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comment, setComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [currentScreenshot, setCurrentScreenshot] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    fetchAppDetails()
  }, [id])

  const fetchAppDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // 获取用户token（如果已登录）
      const token = session?.accessToken as string | undefined

      // 获取应用详情（issue）
      const appData = await getAppDetails(Number.parseInt(id), token)
      setApp(appData)

      // 解析Markdown前置元数据
      try {
        const { data, content } = matter(appData.body)
        setAppData({ frontmatter: data, content })

        // 从前置元数据中获取仓库URL
        const repoUrl = data.repo

        if (repoUrl) {
          // 从 URL 中提取仓库所有者和名称
          const urlParts = repoUrl.split("/")
          const owner = urlParts[urlParts.length - 2]
          const repo = urlParts[urlParts.length - 1].replace(/\/$/, "") // 移除可能的尾部斜杠

          // 获取仓库信息
          try {
            const repoData = await getRepository(owner, repo, token)
            setRepository(repoData)

            // 获取README内容
            try {
              const readmeData = await getReadme(owner, repo, token)
              setReadme(readmeData)
            } catch (readmeErr) {
              console.error("README获取失败:", readmeErr)
            }
          } catch (repoErr) {
            console.error("仓库信息获取失败:", repoErr)
          }
        }
      } catch (parseErr) {
        console.error("解析Markdown前置元数据失败:", parseErr)
        setError("解析应用数据失败，格式可能不正确")
      }

      // 获取应用评论
      const commentsData = await getAppComments(Number.parseInt(id), token)
      setComments(commentsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: app?.title || "开源应用商店",
        text: appData?.frontmatter?.description || "查看这个开源应用",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "链接已复制",
        description: "应用链接已复制到剪贴板",
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
      await addComment(Number.parseInt(id), comment, session.accessToken as string)

      toast({
        title: "评论成功",
        description: "您的评论已成功发布",
      })

      // 重新获取评论
      const token = session?.accessToken as string | undefined
      const commentsData = await getAppComments(Number.parseInt(id), token)
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

  // 处理截图导航
  const navigateScreenshot = (direction: "prev" | "next") => {
    const screenshots = appData?.frontmatter?.screenshots || []
    if (screenshots.length === 0) return

    if (direction === "prev") {
      setCurrentScreenshot((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1))
    } else {
      setCurrentScreenshot((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0))
    }
  }

  // 打开截图灯箱
  const openLightbox = (index: number) => {
    setCurrentScreenshot(index)
    setLightboxOpen(true)
  }

  // 关闭截图灯箱
  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return "未知"
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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

  if (error || !app || !appData) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">获取应用信息失败</h1>
          <p className="text-muted-foreground mb-6">{error || "应用不存在或已被删除"}</p>
          <Button asChild>
            <Link href="/apps">返回应用列表</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { frontmatter, content } = appData
  const repoUrl = frontmatter.repo
  const screenshots = frontmatter.screenshots || []

  // 从 URL 中提取仓库所有者和名称
  let owner = ""
  let repo = ""

  if (repoUrl) {
    const urlParts = repoUrl.split("/")
    owner = urlParts[urlParts.length - 2]
    repo = urlParts[urlParts.length - 1].replace(/\/$/, "") // 移除可能的尾部斜杠
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Link href="/apps" className="hover:underline">
                应用列表
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">{app.title}</span>
            </div>

            <h1 className="text-3xl font-bold mb-2">{app.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">
              {repoUrl && (
                <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {owner}/{repo}
                </a>
              )}
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              {repoUrl && (
                <Button asChild>
                  <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    访问 GitHub
                  </a>
                </Button>
              )}
              {frontmatter.website && (
                <Button asChild variant="outline">
                  <a href={frontmatter.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    官方网站
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
              <Button variant="outline">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                收藏
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {frontmatter.category && (
                <Badge variant="default" className="bg-primary">
                  {frontmatter.category}
                </Badge>
              )}
              {Array.isArray(frontmatter.tags) &&
                frontmatter.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              {typeof frontmatter.tags === "string" &&
                frontmatter.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0)
                  .map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-500 mb-1" />
                  <div className="text-xl font-bold">{(repository?.stargazers_count || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">星标</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <GitFork className="h-5 w-5 text-blue-500 mb-1" />
                  <div className="text-xl font-bold">{(repository?.forks_count || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">分支</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Eye className="h-5 w-5 text-green-500 mb-1" />
                  <div className="text-xl font-bold">{(repository?.watchers_count || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">关注</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-500 mb-1" />
                  <div className="text-xl font-bold">{(repository?.open_issues_count || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">问题</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="description">
              <TabsList className="mb-4">
                <TabsTrigger value="description">描述</TabsTrigger>
                {readme && <TabsTrigger value="readme">README</TabsTrigger>}
                {screenshots.length > 0 && <TabsTrigger value="screenshots">截图 ({screenshots.length})</TabsTrigger>}
                <TabsTrigger value="comments">评论 ({comments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardContent className="p-6">
                    <MarkdownPreview source={content} />
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      提交于 {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              {readme && (
                <TabsContent value="readme">
                  <Card>
                    <CardHeader>
                      <CardTitle>README</CardTitle>
                      <CardDescription>项目README文档</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <MarkdownPreview source={readme.content} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {screenshots.length > 0 && (
                <TabsContent value="screenshots">
                  <Card>
                    <CardHeader>
                      <CardTitle>应用截图</CardTitle>
                      <CardDescription>查看应用的界面和功能</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* 截图轮播 */}
                      <div className="relative mb-4">
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                          <img
                            src={screenshots[currentScreenshot] || "/placeholder.svg"}
                            alt={`应用截图 ${currentScreenshot + 1}`}
                            className="w-full h-full object-contain"
                            onClick={() => openLightbox(currentScreenshot)}
                          />

                          {screenshots.length > 1 && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                                onClick={() => navigateScreenshot("prev")}
                              >
                                <ChevronLeft className="h-6 w-6" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                                onClick={() => navigateScreenshot("next")}
                              >
                                <ChevronRight className="h-6 w-6" />
                              </Button>
                            </>
                          )}
                        </div>
                        <div className="text-center mt-2 text-sm text-muted-foreground">
                          点击图片查看大图 • {currentScreenshot + 1} / {screenshots.length}
                        </div>
                      </div>

                      {/* 缩略图导航 */}
                      {screenshots.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                          {screenshots.map((screenshot, index) => (
                            <div
                              key={index}
                              className={`cursor-pointer rounded-md overflow-hidden border-2 ${index === currentScreenshot ? "border-primary" : "border-transparent"
                                }`}
                              onClick={() => setCurrentScreenshot(index)}
                            >
                              <img
                                src={screenshot || "/placeholder.svg"}
                                alt={`缩略图 ${index + 1}`}
                                className="w-full h-16 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="comments">
                <Card>
                  <CardHeader>
                    <CardTitle>评论</CardTitle>
                    <CardDescription>分享您对这个应用的看法</CardDescription>
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
                                <AvatarImage
                                  src={comment.user.avatar_url || "/placeholder.svg"}
                                  alt={comment.user.login}
                                />
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
              </TabsContent>
            </Tabs>
          </div>

          <div className="md:w-1/3">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>应用信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 作者信息 */}
                  {repository?.owner && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={repository.owner.avatar_url || "/placeholder.svg"}
                          alt={repository.owner.login}
                        />
                        <AvatarFallback>{repository.owner.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{repository.owner.login}</h4>
                        <a
                          href={repository.owner.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          查看资料
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 应用基本信息 */}
                  <div className="space-y-2">
                    {frontmatter.version && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Tag className="h-3.5 w-3.5 mr-2" />
                          版本
                        </span>
                        <span>{frontmatter.version}</span>
                      </div>
                    )}
                    {repository?.license && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <FileText className="h-3.5 w-3.5 mr-2" />
                          许可证
                        </span>
                        <span>{repository.license.spdx_id || repository.license.name}</span>
                      </div>
                    )}
                    {repository?.language && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Code className="h-3.5 w-3.5 mr-2" />
                          主要语言
                        </span>
                        <span>{repository.language}</span>
                      </div>
                    )}
                    {frontmatter.category && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Tag className="h-3.5 w-3.5 mr-2" />
                          分类
                        </span>
                        <span>{frontmatter.category}</span>
                      </div>
                    )}
                  </div>

                  {/* 时间信息 */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        创建于
                      </span>
                      <span>{formatDate(repository?.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-2" />
                        最后更新
                      </span>
                      <span>{formatDate(repository?.updated_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        提交于
                      </span>
                      <span>{formatDate(app.created_at)}</span>
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <Star className="h-3.5 w-3.5 mr-2" />
                        星标数
                      </span>
                      <span>{(repository?.stargazers_count || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <GitFork className="h-3.5 w-3.5 mr-2" />
                        分支数
                      </span>
                      <span>{(repository?.forks_count || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <MessageSquare className="h-3.5 w-3.5 mr-2" />
                        问题数
                      </span>
                      <span>{(repository?.open_issues_count || 0).toLocaleString()}</span>
                    </div>
                    {screenshots.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">截图数量</span>
                        <span>{screenshots.length}</span>
                      </div>
                    )}
                  </div>

                  {/* 相关链接 */}
                  {repoUrl && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">相关链接</h4>
                      <div className="space-y-2">
                        {repository?.homepage && (
                          <a
                            href={repository.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            项目主页
                          </a>
                        )}
                        <a
                          href={`${repoUrl}/wiki`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm hover:underline"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Wiki
                        </a>
                        <a
                          href={`${repoUrl}/releases`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm hover:underline"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          发布版本
                        </a>
                        <a
                          href={app.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm hover:underline"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          查看原始 Issue
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 截图灯箱 */}
      {lightboxOpen && screenshots.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={closeLightbox}>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={screenshots[currentScreenshot] || "/placeholder.svg"}
              alt={`应用截图 ${currentScreenshot + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {screenshots.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateScreenshot("prev")
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateScreenshot("next")
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-background/20 hover:bg-background/40"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {currentScreenshot + 1} / {screenshots.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

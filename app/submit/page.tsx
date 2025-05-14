"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Github, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MarkdownEditor } from "@/components/markdown-editor"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import matter from "gray-matter"

// 从新的服务模块导入
import { submitApp } from "@/services/apps-api"

// 应用提交模板 - 删除了从GitHub API获取的字段
const APP_TEMPLATE = `---
name: 应用名称
repo: https://github.com/username/repo
category: 前端框架
tags: react, ui, 组件库
website: https://example.com
version: 1.0.0
description: 简短的应用描述
screenshots:
  - https://example.com/screenshot1.png
  - https://example.com/screenshot2.png
---

## 详细介绍

在这里详细介绍应用的功能、特点和使用场景。

## 特性

- 特性1：描述特性1
- 特性2：描述特性2
- 特性3：描述特性3

## 安装方法

\`\`\`bash
npm install your-package-name
\`\`\`

## 使用示例

\`\`\`javascript
import { Component } from 'your-package-name';

function App() {
  return <Component />;
}
\`\`\`
`

export default function SubmitPage() {
  const [markdownContent, setMarkdownContent] = useState(APP_TEMPLATE)
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
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 如果未登录，不渲染页面内容（虽然会被重定向，但为了安全起见）
  if (!session) {
    return null
  }

  const handleSubmit = async () => {
    try {
      // 使用gray-matter解析前置元数据
      const { data: frontmatter, content } = matter(markdownContent)

      // 验证必填字段
      const requiredFields = ["name", "repo", "category", "description"]
      const missingFields = requiredFields.filter((field) => !frontmatter[field])

      if (missingFields.length > 0) {
        toast({
          title: "缺少必填字段",
          description: `请填写以下字段: ${missingFields.join(", ")}`,
          variant: "destructive",
        })
        return
      }

      // 验证 GitHub 仓库 URL 格式
      const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/
      if (!githubUrlPattern.test(frontmatter.repo)) {
        toast({
          title: "无效的 GitHub 仓库 URL",
          description: "请输入有效的 GitHub 仓库 URL，例如 https://github.com/username/repo",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)

      // 准备标签数组
      const tags = frontmatter.tags
        ? typeof frontmatter.tags === "string"
          ? frontmatter.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
          : Array.isArray(frontmatter.tags)
            ? frontmatter.tags
            : []
        : []

      // 提交应用（创建 issue）
      await submitApp(
        {
          title: frontmatter.name,
          // 直接提交整个Markdown内容，包括前置元数据
          markdownContent: markdownContent,
          // 以下字段仅用于标签和分类
          category: frontmatter.category,
          tags: tags,
        },
        session.accessToken as string,
      )

      toast({
        title: "提交成功",
        description: "您的应用已成功提交，等待审核",
      })

      // 重定向到应用列表页面
      router.push("/apps")
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
    <div className="container py-8 mx-auto">
      <div className="">
        <h1 className="text-3xl font-bold mb-6">提交应用</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>使用Markdown提交应用</CardTitle>
                <CardDescription>使用前置元数据格式提交您的应用信息</CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">前置元数据格式说明</h4>
                    <p className="text-sm text-muted-foreground">
                      前置元数据部分位于两个 <code>---</code> 之间，包含应用的基本信息。
                    </p>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>必填字段：</strong>
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>
                          <code>name</code>: 应用名称
                        </li>
                        <li>
                          <code>repo</code>: GitHub仓库地址
                        </li>
                        <li>
                          <code>category</code>: 应用分类
                        </li>
                        <li>
                          <code>description</code>: 简短描述
                        </li>
                      </ul>
                      <p className="mt-2">
                        <strong>选填字段：</strong>
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>
                          <code>tags</code>: 标签，用逗号分隔
                        </li>
                        <li>
                          <code>website</code>: 官方网站
                        </li>
                        <li>
                          <code>version</code>: 当前版本
                        </li>
                        <li>
                          <code>screenshots</code>: 截图URL数组
                        </li>
                      </ul>
                      <p className="mt-2">
                        <strong>提交说明：</strong>
                      </p>
                      <p>
                        提交的项目将作为 issue 创建在 OpenSourceAppStore/NotGitHubAppStore
                        仓库中，管理员审核后将添加到应用商店。请确保前置元数据格式正确，并提供详细的应用介绍。
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>

            <MarkdownEditor
              value={markdownContent}
              onChange={(value) => setMarkdownContent(value || "")}
              height={500}
              preview="live"
            />




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

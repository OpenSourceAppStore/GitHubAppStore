"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Github, LogIn } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  if (loading) {
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <Tabs defaultValue="submissions">
            <TabsList className="mb-8">
              <TabsTrigger value="submissions">我的提交</TabsTrigger>
              <TabsTrigger value="favorites">我的收藏</TabsTrigger>
              <TabsTrigger value="comments">我的评论</TabsTrigger>
            </TabsList>
            <TabsContent value="submissions">
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-4 w-60" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle>需要登录</CardTitle>
              <CardDescription>请登录后查看您的个人资料</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Button asChild>
                <Link href="/auth/signin">
                  <LogIn className="mr-2 h-4 w-4" />
                  登录
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "用户头像"} />
            <AvatarFallback className="text-2xl">{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{session.user?.name}</h1>
            <p className="text-muted-foreground">{session.user?.email}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`https://github.com/${session.user?.login}`} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub 主页
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="submissions">
          <TabsList className="mb-8">
            <TabsTrigger value="submissions">我的提交</TabsTrigger>
            <TabsTrigger value="favorites">我的收藏</TabsTrigger>
            <TabsTrigger value="comments">我的评论</TabsTrigger>
          </TabsList>
          <TabsContent value="submissions">
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">您还没有提交任何应用</p>
              <Button asChild>
                <Link href="/submit">提交应用</Link>
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="favorites">
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">您还没有收藏任何应用</p>
              <Button asChild>
                <Link href="/apps">浏览应用</Link>
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="comments">
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">您还没有发表任何评论</p>
              <Button asChild>
                <Link href="/apps">浏览应用</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

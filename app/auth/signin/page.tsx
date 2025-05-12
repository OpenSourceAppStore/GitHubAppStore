"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const error = searchParams.get("error")

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn("github", { callbackUrl })
    setIsLoading(false)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>使用 GitHub 账号登录以访问更多功能</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
              {error === "OAuthSignin" && "GitHub 登录过程中出现错误，请重试。"}
              {error === "OAuthCallback" && "GitHub 回调过程中出现错误，请重试。"}
              {error === "OAuthCreateAccount" && "无法创建 GitHub 账号，请重试。"}
              {error === "EmailCreateAccount" && "无法创建账号，请重试。"}
              {error === "Callback" && "GitHub 回调过程中出现错误，请重试。"}
              {error === "OAuthAccountNotLinked" && "此邮箱已关联其他账号，请使用其他登录方式。"}
              {error === "EmailSignin" && "邮箱验证链接发送失败，请重试。"}
              {error === "CredentialsSignin" && "登录失败，请检查您提供的详细信息。"}
              {![
                "OAuthSignin",
                "OAuthCallback",
                "OAuthCreateAccount",
                "EmailCreateAccount",
                "Callback",
                "OAuthAccountNotLinked",
                "EmailSignin",
                "CredentialsSignin",
              ].includes(error) && "登录过程中出现错误，请重试。"}
            </div>
          )}
          <Button variant="outline" onClick={handleSignIn} disabled={isLoading} className="w-full">
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                登录中...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Github className="mr-2 h-4 w-4" />
                使用 GitHub 登录
              </span>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-xs text-center text-muted-foreground">
            登录即表示您同意我们的
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              服务条款
            </a>
            和
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              隐私政策
            </a>
            。
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "服务器配置错误，请联系管理员。"
      case "AccessDenied":
        return "访问被拒绝，您没有权限访问此资源。"
      case "Verification":
        return "登录链接已过期或已被使用。"
      case "OAuthSignin":
        return "启动OAuth登录流程时出错。"
      case "OAuthCallback":
        return "GitHub回调过程中出现错误。"
      case "OAuthCreateAccount":
        return "无法创建OAuth账号。"
      case "EmailCreateAccount":
        return "无法创建账号。"
      case "Callback":
        return "回调过程中出现错误。"
      case "OAuthAccountNotLinked":
        return "此邮箱已关联其他账号，请使用其他登录方式。"
      case "EmailSignin":
        return "邮箱验证链接发送失败。"
      case "CredentialsSignin":
        return "登录失败，请检查您提供的详细信息。"
      default:
        return "认证过程中出现错误，请重试。"
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-2xl font-bold">认证错误</CardTitle>
          </div>
          <CardDescription>登录过程中出现了问题</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">{getErrorMessage(error)}</div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/signin">返回登录</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

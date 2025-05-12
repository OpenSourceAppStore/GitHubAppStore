"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SignOut() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ callbackUrl: "/" })
    setIsLoading(false)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">退出登录</CardTitle>
          <CardDescription>确定要退出登录吗？</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col space-y-2">
            <Button onClick={handleSignOut} disabled={isLoading} className="w-full">
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  退出中...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  确认退出
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="w-full">
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

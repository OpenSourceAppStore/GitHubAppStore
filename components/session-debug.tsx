"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SessionDebug() {
  const { data: session, status } = useSession()
  const { toast } = useToast()

  // 处理复制到剪贴板
  const handleCopy = () => {
    if (session) {
      navigator.clipboard.writeText(JSON.stringify(session, null, 2))
      toast({
        title: "已复制",
        description: "会话信息已复制到剪贴板",
      })
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>会话调试信息</CardTitle>
        {session && (
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            复制
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>状态:</strong> {status}
          </p>

          {status === "authenticated" && session ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          ) : status === "loading" ? (
            <p className="text-muted-foreground">加载中...</p>
          ) : (
            <p className="text-muted-foreground">未登录</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

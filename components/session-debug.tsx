"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SessionDebug() {
  const { data: session, status } = useSession()
  const [showToken, setShowToken] = useState(false)

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>会话调试信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>状态:</strong> {status}
          </p>
          {session && (
            <>
              <p>
                <strong>用户:</strong> {session.user?.name}
              </p>
              <p>
                <strong>邮箱:</strong> {session.user?.email}
              </p>
              <p>
                <strong>令牌:</strong>{" "}
                {showToken ? (
                  <span className="font-mono text-xs break-all">
                    {session.accessToken ? session.accessToken : "未找到令牌"}
                  </span>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setShowToken(true)}>
                    显示令牌
                  </Button>
                )}
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

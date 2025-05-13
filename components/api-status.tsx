"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
// 从新的服务模块导入
import { getRateLimit } from "@/services/api-status"

export function ApiStatus() {
  const [rateLimit, setRateLimit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchRateLimit = async () => {
      try {
        // 如果用户已登录，使用其token请求API
        const token = session?.accessToken as string | undefined
        const data = await getRateLimit(token)
        setRateLimit(data)
        setError(null)
      } catch (err) {
        setError("无法获取API状态")
        console.error("Error fetching rate limit:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRateLimit()

    // 每分钟更新一次
    const intervalId = setInterval(fetchRateLimit, 60000)
    return () => clearInterval(intervalId)
  }, [session]) // 添加session作为依赖，当session变化时重新获取

  if (loading) {
    return <span className="text-sm text-muted-foreground">加载API状态...</span>
  }

  if (error) {
    return (
      <span className="text-sm text-muted-foreground flex items-center">
        <AlertCircle className="h-4 w-4 mr-1 text-destructive" />
        API状态: 未知
      </span>
    )
  }

  // 获取所有资源类型的速率限制信息
  const resourceTypes = Object.keys(rateLimit || {}).filter(
    (key) => typeof rateLimit[key] === "object" && rateLimit[key] !== null && "limit" in rateLimit[key],
  )

  if (resourceTypes.length === 0) {
    return <span className="text-sm text-muted-foreground">API状态: 未知</span>
  }

  // 获取核心API的限制信息用于简要显示
  const core = rateLimit?.core
  if (!core) {
    return <span className="text-sm text-muted-foreground">API状态: 未知</span>
  }

  // 计算核心API剩余请求的百分比
  const coreRemainingPercent = Math.round((core.remaining / core.limit) * 100)

  // 根据剩余请求百分比确定状态图标和颜色
  let StatusIcon = CheckCircle
  let statusColor = "text-green-500"

  if (coreRemainingPercent < 10) {
    StatusIcon = AlertCircle
    statusColor = "text-destructive"
  } else if (coreRemainingPercent < 30) {
    StatusIcon = AlertTriangle
    statusColor = "text-amber-500"
  }

  // 格式化资源类型名称
  const formatResourceName = (name: string) => {
    switch (name) {
      default:
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ")
    }
  }

  // 计算重置时间
  const getResetTime = (resetTimestamp: number) => {
    const resetDate = new Date(resetTimestamp * 1000)
    const now = new Date()
    const minutesUntilReset = Math.round((resetDate.getTime() - now.getTime()) / 60000)
    return {
      time: resetDate.toLocaleTimeString(),
      minutes: minutesUntilReset,
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm text-muted-foreground flex items-center">
          <StatusIcon className={`h-4 w-4 mr-1 ${statusColor}`} />
          <span>GitHub API 状态 {session ? "(已认证)" : "(未认证)"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">GitHub API 速率限制</h4>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground mr-2">{session ? "已使用GitHub认证" : "未认证状态"}</span>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {resourceTypes.map((type) => {
            const resource = rateLimit[type]
            if (resource.remaining == 0 || resource.limit == 0) return null
            const remainingPercent = Math.round((resource.remaining / resource.limit) * 100)
            const reset = getResetTime(resource.reset)

            let progressColor = "bg-green-500"
            if (remainingPercent < 10) {
              progressColor = "bg-destructive"
            } else if (remainingPercent < 30) {
              progressColor = "bg-amber-500"
            }

            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{formatResourceName(type)}</span>
                  <span>
                    {resource.remaining}/{resource.limit} ({remainingPercent}%)
                  </span>
                </div>
                <Progress value={remainingPercent} className={`h-2  ${progressColor}`}  />
                <p className="text-xs text-muted-foreground text-right">
                  重置于 {reset.time} (约 {reset.minutes} 分钟后)
                </p>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

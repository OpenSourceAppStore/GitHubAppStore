"use client"

import { SessionDebug } from "@/components/session-debug"

export default function DebugPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">会话调试页面</h1>
        <p className="text-muted-foreground mb-6">此页面显示当前会话的所有信息，用于调试和开发目的。</p>

        <SessionDebug />
      </div>
    </div>
  )
}

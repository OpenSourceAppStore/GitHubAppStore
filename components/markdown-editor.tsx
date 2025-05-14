"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Card } from "@/components/ui/card"

// 动态导入编辑器组件以避免SSR问题
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false })
const MDEditorPreview = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown), {
  ssr: false,
})

// 防止Tailwind的样式影响编辑器
const editorStyles = `
  .w-md-editor-text-pre > code,
  .w-md-editor-text-input {
    font-family: monospace !important;
  }
`

interface MarkdownEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  preview?: "live" | "edit" | "preview"
  height?: number
  minHeight?: number
  maxHeight?: number
  visibleDragbar?: boolean
  hideToolbar?: boolean
  enableScroll?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  preview = "live",
  height = 400,
  minHeight,
  maxHeight,
  visibleDragbar = true,
  hideToolbar = false,
  enableScroll = true,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"light" | "dark">("light")

  // 检测当前主题
  if (typeof window !== "undefined") {
    const isDarkMode = document.documentElement.classList.contains("dark")
    if ((isDarkMode && mode === "light") || (!isDarkMode && mode === "dark")) {
      setMode(isDarkMode ? "dark" : "light")
    }
  }

  return (
    <>
      <style>{editorStyles}</style>
      <div data-color-mode={mode}>
        <MDEditor
          value={value}
          onChange={onChange}
          preview={preview}
          height={height}
          minHeight={minHeight}
          maxHeight={maxHeight}
          visibleDragbar={visibleDragbar}
          hideToolbar={hideToolbar}
          enableScroll={enableScroll}
        />
      </div>
    </>
  )
}

export function MarkdownPreview({ source }: { source: string }) {
  const [mode, setMode] = useState<"light" | "dark">("light")

  // 检测当前主题
  if (typeof window !== "undefined") {
    const isDarkMode = document.documentElement.classList.contains("dark")
    if ((isDarkMode && mode === "light") || (!isDarkMode && mode === "dark")) {
      setMode(isDarkMode ? "dark" : "light")
    }
  }

  return (
    
      <div data-color-mode={mode}>
        <MDEditorPreview source={source} />
      </div>
     
  )
}

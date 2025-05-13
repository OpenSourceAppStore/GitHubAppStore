/**
 * API请求工具函数
 */

// GitHub API基础URL（内部常量，不导出）
const BASE_API_URL = "https://api.github.com"

// 仓库信息（内部常量，不导出）
const REPO_OWNER = "OpenSourceAppStore"
const REPO_NAME = "NotGitHubAppStore"

/**
 * 创建请求头
 * @param token 可选的访问令牌
 * @returns 请求头对象
 */
export function createHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

/**
 * 通用的GitHub API请求函数
 * @param url 请求URL
 * @param options 请求选项
 * @param errorMessage 错误信息前缀
 * @returns 请求结果
 */
export async function fetchGitHubAPI<T>(
  url: string,
  options: RequestInit = {},
  errorMessage = "API请求失败",
): Promise<T> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      let errorDetail = ""
      try {
        const errorData = await response.json()
        errorDetail = errorData.message || ""
      } catch (e) {
        // 无法解析错误详情，忽略
      }

      throw new Error(
        `${errorMessage}: ${response.status} ${response.statusText}${errorDetail ? ` - ${errorDetail}` : ""}`,
      )
    }

    return await response.json()
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    throw error
  }
}

/**
 * 格式化数字（如星标数）
 * @param num 要格式化的数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

/**
 * 简单的 Markdown 转 HTML 函数
 * @param markdown Markdown文本
 * @returns HTML文本
 */
export function convertMarkdownToHtml(markdown: string): string {
  // 这只是一个非常简单的实现，实际应用中应使用 marked.js 或其他库
  let html = markdown
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/\*\*(.*)\*\*/gm, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gm, "<em>$1</em>")
    .replace(/\[(.*?)\]$$(.*?)$$/gm, '<a href="$2">$1</a>')
    .replace(/!\[(.*?)\]$$(.*?)$$/gm, '<img alt="$1" src="$2" />')
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/```([\s\S]*?)```/gm, "<pre><code>$1</code></pre>")

  // 将连续的 <li> 包装在 <ul> 中
  html = html.replace(/<li>[\s\S]*?<\/li>/g, (match) => {
    return "<ul>" + match + "</ul>"
  })

  return html
}

/**
 * 获取仓库API URL
 * @param path API路径
 * @returns 完整的API URL
 */
export function getRepoApiUrl(path: string): string {
  return `${BASE_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}${path}`
}

/**
 * 获取GitHub API URL
 * @param path API路径
 * @returns 完整的API URL
 */
export function getGitHubApiUrl(path: string): string {
  return `${BASE_API_URL}${path}`
}

const REPO_OWNER = "OpenSourceAppStore"
const REPO_NAME = "NotGitHubAppStore" // 更新为新的仓库名称
const BASE_API_URL = "https://api.github.com"

// 格式化数字（如星标数）
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// 获取应用商店仓库的 issues（作为应用列表）
export async function getApps(page = 1, perPage = 10, labels?: string[]) {
  const labelsQuery = labels && labels.length > 0 ? `+label:${labels.join("+label:")}` : ""
  const url = `${BASE_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=open&per_page=${perPage}&page=${page}&labels=app${labelsQuery}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      // 增加缓存控制
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch apps:", error)
    throw error
  }
}

// 获取单个应用详情（通过 issue 编号）
export async function getAppDetails(issueNumber: number) {
  const url = `${BASE_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      // 增加缓存控制
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch app details:", error)
    throw error
  }
}

// 获取应用评论（通过 issue 编号）
export async function getAppComments(issueNumber: number) {
  const url = `${BASE_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      // 增加缓存控制
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch app comments:", error)
    throw error
  }
}

// 提交新应用（创建 issue）
export async function submitApp(
  appData: {
    title: string
    repoUrl: string
    description: string
    category: string
    tags: string[]
  },
  token: string,
) {
  const url = `${BASE_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues`

  // 构建 issue 内容，遵循模板格式
  const body = `
## 应用信息

- **仓库地址**: ${appData.repoUrl}
- **分类**: ${appData.category}
- **标签**: ${appData.tags.join(", ")}

## 描述

${appData.description}

## 提交者

${new Date().toISOString().split("T")[0]}
`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // 修改授权头格式为Bearer
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: appData.title,
        body: body,
        labels: ["app", ...appData.tags, appData.category],
      }),
    })

    if (!response.ok) {
      // 获取更详细的错误信息
      const errorData = await response.json().catch(() => ({}))
      console.error("GitHub API错误:", errorData)

      if (response.status === 401) {
        throw new Error("授权失败：GitHub令牌无效或已过期")
      } else if (response.status === 403) {
        throw new Error("权限不足：您的GitHub账号没有创建issue的权限")
      } else if (response.status === 422) {
        throw new Error("请求无效：" + (errorData.message || "请检查提交的数据"))
      } else {
        throw new Error(`GitHub API错误 (${response.status}): ${errorData.message || "未知错误"}`)
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to submit app:", error)
    throw error
  }
}

// 添加评论到应用（issue）
export async function addComment(issueNumber: number, comment: string, token: string) {
  const url = `${BASE_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: comment,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to add comment:", error)
    throw error
  }
}

// 获取仓库信息
export async function getRepository(owner: string, repo: string) {
  const url = `${BASE_API_URL}/repos/${owner}/${repo}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch repository:", error)
    throw error
  }
}

// 获取 README 内容
export async function getReadme(owner: string, repo: string) {
  const url = `${BASE_API_URL}/repos/${owner}/${repo}/readme`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // 修复中文乱码问题
    // 1. 使用 atob 获取二进制字符串
    const binaryString = atob(data.content)
    // 2. 将二进制字符串转换为 Uint8Array
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    // 3. 使用 TextDecoder 将 Uint8Array 解码为 UTF-8 字符串
    const content = new TextDecoder("utf-8").decode(bytes)

    // 简单的 Markdown 转 HTML（实际应用中应使用专业的 Markdown 解析库）
    const html = convertMarkdownToHtml(content)

    return {
      ...data,
      content: html,
    }
  } catch (error) {
    console.error("Failed to fetch README:", error)
    throw error
  }
}

// 简单的 Markdown 转 HTML 函数（实际应用中应使用专业的 Markdown 解析库）
function convertMarkdownToHtml(markdown: string): string {
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

// 获取仓库 issues
export async function getIssues(owner: string, repo: string) {
  const url = `${BASE_API_URL}/repos/${owner}/${repo}/issues?state=open&per_page=10`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch issues:", error)
    throw error
  }
}

// 搜索仓库
export async function searchRepositories(query: string, page = 1, perPage = 10, sort = "stars", order = "desc") {
  const url = `${BASE_API_URL}/search/repositories?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&sort=${sort}&order=${order}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to search repositories:", error)
    throw error
  }
}

// 获取热门仓库
export async function getTrendingRepositories(language: string, period: string) {
  const baseUrl = `${BASE_API_URL}/search/repositories`
  const dateRange = getDateRange(period)
  const query = `q=created:${dateRange}${language ? `+language:${language}` : ""}&sort=stars&order=desc`
  const url = `${baseUrl}?${query}`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch trending repositories:", error)
    throw error
  }
}

// 获取日期范围
function getDateRange(period: string): string {
  const today = new Date()
  let startDate: Date

  switch (period) {
    case "daily":
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 1)
      break
    case "weekly":
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 7)
      break
    case "monthly":
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 30)
      break
    default:
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 1)
  }

  const year = startDate.getFullYear()
  const month = String(startDate.getMonth() + 1).padStart(2, "0")
  const day = String(startDate.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}..${today.toISOString().slice(0, 10)}`
}

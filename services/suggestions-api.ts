import { createHeaders, fetchGitHubAPI, getRepoApiUrl } from "@/utils/api"

/**
 * 获取需求建议列表
 * @param page 页码
 * @param perPage 每页数量
 * @param token 访问令牌
 * @returns 需求建议列表
 */
export async function getSuggestions(page = 1, perPage = 10, token?: string) {
  const url = getRepoApiUrl(`/issues?state=open&per_page=${perPage}&page=${page}&labels=suggestion`)

  const headers = createHeaders(token)

  return fetchGitHubAPI(
    url,
    {
      headers,
      cache: "no-store",
    },
    "获取需求建议列表失败",
  )
}

/**
 * 获取需求建议详情
 * @param issueNumber issue编号
 * @param token 访问令牌
 * @returns 需求建议详情
 */
export async function getSuggestionDetails(issueNumber: number, token?: string) {
  const url = getRepoApiUrl(`/issues/${issueNumber}`)

  const headers = createHeaders(token)

  return fetchGitHubAPI(
    url,
    {
      headers,
      cache: "no-store",
    },
    "获取需求建议详情失败",
  )
}

/**
 * 获取需求建议评论
 * @param issueNumber issue编号
 * @param token 访问令牌
 * @returns 评论列表
 */
export async function getSuggestionComments(issueNumber: number, token?: string) {
  const url = getRepoApiUrl(`/issues/${issueNumber}/comments`)

  const headers = createHeaders(token)

  return fetchGitHubAPI(
    url,
    {
      headers,
      cache: "no-store",
    },
    "获取需求建议评论失败",
  )
}

/**
 * 提交新需求建议
 * @param suggestionData 需求建议数据
 * @param token 访问令牌
 * @returns 提交结果
 */
export async function submitSuggestion(
  suggestionData: {
    title: string
    description: string
    type: string
    priority: string
  },
  token: string,
) {
  const url = getRepoApiUrl("/issues")

  // 构建 issue 内容，遵循模板格式
  const body = `
## 需求建议

- **类型**: ${suggestionData.type}
- **优先级**: ${suggestionData.priority}

## 详细描述

${suggestionData.description}

## 提交者

${new Date().toISOString().split("T")[0]}
`

  const headers = createHeaders(token)
  headers["Content-Type"] = "application/json"

  return fetchGitHubAPI(
    url,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: suggestionData.title,
        body: body,
        labels: ["suggestion", suggestionData.type, suggestionData.priority],
      }),
    },
    "提交需求建议失败",
  )
}

/**
 * 添加评论
 * @param issueNumber issue编号
 * @param comment 评论内容
 * @param token 访问令牌
 * @returns 添加结果
 */
export async function addSuggestionComment(issueNumber: number, comment: string, token: string) {
  const url = getRepoApiUrl(`/issues/${issueNumber}/comments`)

  const headers = createHeaders(token)
  headers["Content-Type"] = "application/json"

  return fetchGitHubAPI(
    url,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        body: comment,
      }),
    },
    "添加评论失败",
  )
}

/**
 * 为需求建议投票（使用reactions）
 * @param issueNumber issue编号
 * @param reaction 反应类型 (+1, -1, laugh, confused, heart, hooray, rocket, eyes)
 * @param token 访问令牌
 * @returns 投票结果
 */
export async function voteSuggestion(issueNumber: number, reaction: string, token: string) {
  const url = getRepoApiUrl(`/issues/${issueNumber}/reactions`)

  const headers = createHeaders(token)
  headers["Content-Type"] = "application/json"
  // GitHub API v3需要特殊的Accept头来使用reactions功能
  headers["Accept"] = "application/vnd.github.squirrel-girl-preview+json"

  return fetchGitHubAPI(
    url,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: reaction,
      }),
    },
    "投票失败",
  )
}

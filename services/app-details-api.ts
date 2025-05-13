import { createHeaders, fetchGitHubAPI, getRepoApiUrl } from "@/utils/api"

/**
 * 获取应用详情
 * @param issueNumber issue编号
 * @param token 访问令牌
 * @returns 应用详情
 */
export async function getAppDetails(issueNumber: number, token?: string) {
  const url = getRepoApiUrl(`/issues/${issueNumber}`)

  const headers = createHeaders(token)

  return fetchGitHubAPI(
    url,
    {
      headers,
      cache: "no-store",
    },
    "获取应用详情失败",
  )
}

/**
 * 获取应用评论
 * @param issueNumber issue编号
 * @param token 访问令牌
 * @returns 评论列表
 */
export async function getAppComments(issueNumber: number, token?: string) {
  const url = getRepoApiUrl(`/issues/${issueNumber}/comments`)

  const headers = createHeaders(token)

  return fetchGitHubAPI(
    url,
    {
      headers,
      cache: "no-store",
    },
    "获取应用评论失败",
  )
}

/**
 * 添加评论
 * @param issueNumber issue编号
 * @param comment 评论内容
 * @param token 访问令牌
 * @returns 添加结果
 */
export async function addComment(issueNumber: number, comment: string, token: string) {
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

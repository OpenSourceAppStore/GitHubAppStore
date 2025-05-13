import { createHeaders, fetchGitHubAPI, getGitHubApiUrl } from "@/utils/api"

/**
 * 获取API速率限制信息
 * @param token 访问令牌
 * @returns 速率限制信息
 */
export async function getRateLimit(token?: string) {
  const url = getGitHubApiUrl("/rate_limit")

  const headers = createHeaders(token)

  const data = await fetchGitHubAPI(
    url,
    {
      headers,
      cache: "no-store",
    },
    "获取API速率限制失败",
  )

  return data.resources
}

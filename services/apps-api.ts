import { createHeaders, fetchGitHubAPI, getRepoApiUrl } from "@/utils/api"

/**
 * 获取应用列表
 * @param page 页码
 * @param perPage 每页数量
 * @param labels 标签过滤
 * @param token 访问令牌
 * @returns 应用列表
 */
export async function getApps(page = 1, perPage = 10, labels?: string[], token?: string) {
  const labelsQuery = labels && labels.length > 0 ? `+label:${labels.join("+label:")}` : ""
  const url = getRepoApiUrl(`/issues?state=open&per_page=${perPage}&page=${page}&labels=app${labelsQuery}`)

  const headers = createHeaders(token)

  return fetchGitHubAPI(
    url,
    {
      headers,
      cache: "no-store",
    },
    "获取应用列表失败",
  )
}

/**
 * 提交新应用
 * @param appData 应用数据
 * @param token 访问令牌
 * @returns 提交结果
 */
export async function submitApp(
  appData: {
    title: string
    markdownContent: string
    category: string
    tags: string[]
  },
  token: string,
) {
  const url = getRepoApiUrl("/issues")

  const headers = createHeaders(token)
  headers["Content-Type"] = "application/json"

  return fetchGitHubAPI(
    url,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: appData.title,
        body: appData.markdownContent,
        labels: ["app", ...appData.tags, appData.category],
      }),
    },
    "提交应用失败",
  )
}

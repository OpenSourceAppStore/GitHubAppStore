import { createHeaders, fetchGitHubAPI, getGitHubApiUrl } from "@/utils/api"

/**
 * 搜索仓库
 * @param query 搜索关键词
 * @param page 页码
 * @param perPage 每页数量
 * @param sort 排序字段
 * @param order 排序顺序
 * @param token 访问令牌
 * @returns 搜索结果
 */
export async function searchRepositories(
  query: string,
  page = 1,
  perPage = 10,
  sort = "stars",
  order = "desc",
  token?: string,
) {
  const url = getGitHubApiUrl(
    `/search/repositories?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&sort=${sort}&order=${order}`,
  )

  const headers = createHeaders(token)

  return fetchGitHubAPI(url, { headers }, "搜索仓库失败")
}

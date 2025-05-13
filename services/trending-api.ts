import { createHeaders, fetchGitHubAPI, getGitHubApiUrl } from "@/utils/api"

/**
 * 获取日期范围字符串
 * @param period 时间段
 * @returns 日期范围字符串
 */
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
      startDate.setMonth(today.getMonth() - 1)
      break
    case "quarterly":
      startDate = new Date(today)
      startDate.setMonth(today.getMonth() - 3)
      break
    case "yearly":
      startDate = new Date(today)
      startDate.setFullYear(today.getFullYear() - 1)
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

/**
 * 获取热门仓库
 * @param language 编程语言
 * @param period 时间段
 * @param sortBy 排序字段
 * @param order 排序顺序
 * @param page 页码
 * @param perPage 每页数量
 * @param token 访问令牌
 * @returns 热门仓库列表
 */
export async function getTrendingRepositories(
  language: string,
  period: string,
  sortBy = "stars",
  order = "desc",
  page = 1,
  perPage = 12,
  token?: string,
) {
  const dateRange = getDateRange(period)
  const query = `q=created:${dateRange}${language ? `+language:${language}` : ""}&sort=${sortBy}&order=${order}&page=${page}&per_page=${perPage}`
  const url = getGitHubApiUrl(`/search/repositories?${query}`)

  const headers = createHeaders(token)

  return fetchGitHubAPI(url, { headers }, "获取热门仓库失败")
}

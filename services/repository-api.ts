import { createHeaders, fetchGitHubAPI, getGitHubApiUrl, convertMarkdownToHtml } from "@/utils/api"

/**
 * 获取仓库信息
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @param token 访问令牌
 * @returns 仓库信息
 */
export async function getRepository(owner: string, repo: string, token?: string) {
  const url = getGitHubApiUrl(`/repos/${owner}/${repo}`)

  const headers = createHeaders(token)

  return fetchGitHubAPI(url, { headers }, "获取仓库信息失败")
}

/**
 * 获取README内容
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @param token 访问令牌
 * @returns README内容
 */
export async function getReadme(owner: string, repo: string, token?: string) {
  const url = getGitHubApiUrl(`/repos/${owner}/${repo}/readme`)

  const headers = createHeaders(token)

  const data = await fetchGitHubAPI(url, { headers }, "获取README失败")

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

  // 转换Markdown为HTML
  const html = convertMarkdownToHtml(content)

  return {
    ...data,
    content: html,
  }
}

/**
 * 获取仓库issues
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @param token 访问令牌
 * @returns issues列表
 */
export async function getIssues(owner: string, repo: string, token?: string) {
  const url = getGitHubApiUrl(`/repos/${owner}/${repo}/issues?state=open&per_page=10`)

  const headers = createHeaders(token)

  return fetchGitHubAPI(url, { headers }, "获取issues失败")
}

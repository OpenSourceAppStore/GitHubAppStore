import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * 扩展Session类型，添加accessToken和login
   */
  interface Session {
    accessToken?: string
    user?: {
      id?: string
      login?: string // GitHub用户名
    } & DefaultSession["user"]
  }

  /**
   * 扩展JWT类型，添加accessToken和login
   */
  interface JWT {
    accessToken?: string
    login?: string // GitHub用户名
  }
}

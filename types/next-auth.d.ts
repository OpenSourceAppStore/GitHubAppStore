import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * 扩展Session类型，添加accessToken
   */
  interface Session {
    accessToken?: string
    user?: {
      id?: string
    } & DefaultSession["user"]
  }

  /**
   * 扩展JWT类型，添加accessToken
   */
  interface JWT {
    accessToken?: string
  }
}

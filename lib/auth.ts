import type { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      // 请求GitHub API的权限范围
      authorization: {
        params: {
          // 我们需要repo和user权限来创建issues和评论
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 将access_token保存到token中，以便后续使用
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // 将access_token添加到session中，以便客户端使用
      session.accessToken = token.accessToken
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  // 启用调试模式（生产环境应设为false）
  debug: process.env.NODE_ENV === "development",
}

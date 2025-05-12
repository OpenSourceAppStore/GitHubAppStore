import type { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      // 只请求用户邮箱权限
      authorization: {
        params: {
          scope: "user:email",
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
  // 启用调试模式以便排查问题
  debug: true,
  // 使用JWT策略
  session: {
    strategy: "jwt",
  },
  // 自定义页面
  pages: {
    error: "/auth/error", // 错误页面
    signIn: "/auth/signin", // 登录页面
  },
  // 添加事件处理
  events: {
    async error(error) {
      console.error("NextAuth错误:", error)
    },
  },
  // 添加日志记录
  logger: {
    error(code, metadata) {
      console.error("NextAuth错误代码:", code, "元数据:", metadata)
    },
    warn(code) {
      console.warn("NextAuth警告:", code)
    },
    debug(code, metadata) {
      console.log("NextAuth调试:", code, metadata)
    },
  },
}

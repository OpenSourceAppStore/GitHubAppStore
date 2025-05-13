import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// 需要登录才能访问的路径
const protectedPaths = ["/submit"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查当前路径是否需要保护
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (isProtectedPath) {
    const token = await getToken({ req: request })

    // 如果用户未登录，重定向到登录页面
    if (!token) {
      const url = new URL(`/auth/signin`, request.url)
      url.searchParams.set("callbackUrl", encodeURI(pathname))
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// 配置匹配的路径
export const config = {
  matcher: ["/submit", "/submit/:path*"],
}

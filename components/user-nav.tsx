"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signIn, signOut } from "next-auth/react"
import { LogIn, LogOut, User, Github, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export function UserNav() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [isSigningIn, setIsSigningIn] = useState(false)
  const { toast } = useToast()

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await signIn("github")
    } catch (error) {
      console.error("登录失败:", error)
      toast({
        title: "登录失败",
        description: "GitHub登录过程中出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full" disabled>
        <span className="sr-only">加载中</span>
      </Button>
    )
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Button variant="outline" size="sm" onClick={handleSignIn} disabled={isSigningIn}>
        {isSigningIn ? (
          <span className="flex items-center">
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
            登录中
          </span>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            登录
          </>
        )}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "用户头像"} />
            <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/submit">
              <Plus className="mr-2 h-4 w-4" />
              <span>提交应用</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              <span>GitHub 设置</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

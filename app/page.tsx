import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Star, Search, Package, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 英雄区域 */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                发现优质开源项目的最佳平台
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                浏览、分享和评论GitHub上的优质开源项目，帮助开发者找到最适合的工具和库。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/apps">
                  <Package className="mr-2 h-5 w-5" />
                  浏览应用
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/submit">
                  <Github className="mr-2 h-5 w-5" />
                  提交应用
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 特色区域 */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">探索开源世界</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                我们的平台提供了多种方式来发现和分享优质的开源项目。
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            <Card className="bg-background">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">搜索发现</h3>
                <p className="text-muted-foreground">通过关键词、分类或标签快速找到您需要的开源项目。</p>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">热门趋势</h3>
                <p className="text-muted-foreground">了解当前最受欢迎的开源项目和新兴技术趋势。</p>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">社区评价</h3>
                <p className="text-muted-foreground">查看社区评论和评分，选择最适合您需求的项目。</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 号召行动区域 */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">加入我们的开源社区</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                分享您喜爱的开源项目，帮助其他开发者发现优质工具。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/auth/signin">
                  <Github className="mr-2 h-5 w-5" />
                  立即登录
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/trending">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  查看热门项目
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

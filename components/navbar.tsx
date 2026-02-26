"use client"

import Link from "next/link"
import { MobileMenu } from "@/components/mobile-menu"
import { TouchLink } from "@/components/ui/touch-link"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { Dictionary, Locale } from "@/lib/dictionary"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavbarProps {
  lang?: Locale
  dict?: Dictionary
}

export function Navbar({ lang = 'zh', dict }: NavbarProps) {
  const pathname = usePathname()
  
  // Fallback for when dict is not provided (e.g. initial render or error)
  const t = dict?.common || {
    loading: "加载中...",
    brand: "MiraclePlus",
    gallery: "Gallery",
    menu: {
      explore: "探索库",
      batches: "历届项目",
      insights: "数据洞察",
      table: "数据表格"
    }
  }

  const prefix = lang === 'zh' ? '' : `/${lang}`

  // Helper to check if link is active
  // Handles both /explore and /en/explore
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '/en';
    const target = prefix + path;
    return pathname === target || pathname.startsWith(target + '/');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <TouchLink
            href={`${prefix}/`}
            className="flex items-center space-x-2 font-bold text-xl p-2 -ml-2 rounded-md active:bg-secondary/50 active:scale-[0.98] transition-colors touch-manipulation block"
          >
            <span className="text-brand">{t.brand}</span>
            <span>{t.gallery}</span>
          </TouchLink>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href={`${prefix}/explore`}
              className={cn(
                "transition-colors touch-manipulation active:opacity-80 [@media(hover:hover)]:hover:text-foreground/80 [@media(hover:hover)]:hover:text-brand",
                isActive('/explore') ? "text-foreground font-semibold" : "text-foreground/60"
              )}
            >
              {t.menu.explore}
            </Link>
            <Link
              href={`${prefix}/batches`}
              className={cn(
                "transition-colors touch-manipulation active:opacity-80 [@media(hover:hover)]:hover:text-foreground/80 [@media(hover:hover)]:hover:text-brand",
                isActive('/batches') ? "text-foreground font-semibold" : "text-foreground/60"
              )}
            >
              {t.menu.batches}
            </Link>
            <Link
              href={`${prefix}/insights`}
              className={cn(
                "transition-colors touch-manipulation active:opacity-80 [@media(hover:hover)]:hover:text-foreground/80 [@media(hover:hover)]:hover:text-brand",
                isActive('/insights') ? "text-foreground font-semibold" : "text-foreground/60"
              )}
            >
              {t.menu.insights}
            </Link>
            <Link
              href={`${prefix}/table`}
              className={cn(
                "transition-colors touch-manipulation active:opacity-80 [@media(hover:hover)]:hover:text-foreground/80 [@media(hover:hover)]:hover:text-brand",
                isActive('/table') ? "text-foreground font-semibold" : "text-foreground/60"
              )}
            >
              {t.menu.table}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle lang={lang} />
          <ModeToggle />
          <MobileMenu lang={lang} dict={dict} />
        </div>
      </div>
    </header>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Dictionary, Locale } from "@/lib/dictionary"

interface MobileMenuProps {
  lang?: Locale
  dict?: Dictionary
}

export function MobileMenu({ lang = 'zh', dict }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader className="px-1 text-left">
            <SheetTitle className="flex items-center space-x-2 font-bold text-xl">
                <span className="text-brand">{t.brand}</span>
                <span>{t.gallery}</span>
            </SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-8 px-2">
          <Link
            href={`${prefix}/explore`}
            onClick={() => setOpen(false)}
            className="block px-2 py-1 text-lg font-medium transition-colors hover:text-brand"
          >
            {t.menu.explore}
          </Link>
          <Link
            href={`${prefix}/batches`}
            onClick={() => setOpen(false)}
            className="block px-2 py-1 text-lg font-medium transition-colors hover:text-brand"
          >
            {t.menu.batches}
          </Link>
          <Link
            href={`${prefix}/insights`}
            onClick={() => setOpen(false)}
            className="block px-2 py-1 text-lg font-medium transition-colors hover:text-brand"
          >
            {t.menu.insights}
          </Link>
          <Link
            href={`${prefix}/table`}
            onClick={() => setOpen(false)}
            className="block px-2 py-1 text-lg font-medium transition-colors hover:text-brand"
          >
            {t.menu.table}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}

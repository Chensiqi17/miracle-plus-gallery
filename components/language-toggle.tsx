"use client"

import * as React from "react"
import { Languages, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Locale } from "@/lib/dictionary"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface LanguageToggleProps {
  lang?: Locale
}

export function LanguageToggle({ lang = 'zh' }: LanguageToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Handle click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const switchLanguage = (targetLang: Locale) => {
    if (targetLang === lang) {
      setIsOpen(false)
      return
    }

    let newPath = pathname
    
    // Check if current path starts with a locale
    const segments = pathname.split('/').filter(Boolean)
    const currentLangPrefix = segments[0] === 'en' ? 'en' : 'zh'
    
    if (targetLang === 'en') {
      if (currentLangPrefix !== 'en') {
        newPath = `/en${pathname === '/' ? '' : pathname}`
      }
    } else {
      // target is zh
      if (currentLangPrefix === 'en') {
        newPath = pathname.replace(/^\/en/, '') || '/'
      }
    }

    setIsOpen(false)
    router.push(newPath)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 text-foreground/60 hover:text-foreground"
      >
        <Languages className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle language</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-lg border border-border/40 bg-popover p-1 shadow-lg animate-in fade-in zoom-in-95 duration-200 z-50 ring-1 ring-black/5 dark:ring-white/5">
          <div className="flex flex-col space-y-0.5">
            <button
              onClick={() => switchLanguage('zh')}
              className={cn(
                "flex items-center justify-between w-full px-2.5 py-2 text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                lang === 'zh' ? "bg-accent/60 text-accent-foreground font-medium" : "text-muted-foreground"
              )}
            >
              <span>中文</span>
              {lang === 'zh' && <Check className="h-3.5 w-3.5 opacity-70" />}
            </button>
            <button
              onClick={() => switchLanguage('en')}
              className={cn(
                "flex items-center justify-between w-full px-2.5 py-2 text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                lang === 'en' ? "bg-accent/60 text-accent-foreground font-medium" : "text-muted-foreground"
              )}
            >
              <span>English</span>
              {lang === 'en' && <Check className="h-3.5 w-3.5 opacity-70" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { AlertTriangle, X } from "lucide-react"
import { useState, useEffect } from "react"

interface TranslationNoticeProps {
  lang: 'zh' | 'en'
}

export function TranslationNotice({ lang }: TranslationNoticeProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show on English version
    if (lang === 'en') {
      // Check if user has dismissed it before
      const dismissed = localStorage.getItem('translation-notice-dismissed')
      if (!dismissed) {
        setIsVisible(true)
      }
    }
  }, [lang])

  const dismiss = () => {
    setIsVisible(false)
    localStorage.setItem('translation-notice-dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 px-4 py-3 relative">
      <div className="container mx-auto flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200 pr-8">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          <strong>Note:</strong> Project details are displayed in their original language (Chinese) to preserve accuracy. 
          We recommend using your browser&apos;s translation feature for the best experience.
        </p>
      </div>
      <button 
        onClick={dismiss}
        className="absolute right-4 top-3 p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-full transition-colors text-amber-800 dark:text-amber-200"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  )
}

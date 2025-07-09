'use client'

import { LanguageToggle } from '@/components/LanguageToggle'
import { ModeToggle } from '@/components/mode-toggle'

export function NavActions() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <LanguageToggle variant="text" size="sm" />
      <ModeToggle />
    </div>
  )
}

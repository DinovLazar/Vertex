'use client'

import { useTranslations } from 'next-intl'

export function TypingIndicator() {
  const t = useTranslations('chat.status')
  return (
    <div
      className="flex items-center gap-1.5 px-4 py-3"
      aria-label={t('generating')}
      role="status"
    >
      {/* Delays live in CSS (.typing-dot:nth-child) so the wave staggers
          left→right; no inline animationDelay (it would override them). */}
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="sr-only">{t('generating')}</span>
    </div>
  )
}

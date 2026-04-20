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
      <span className="typing-dot" />
      <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
      <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
      <span className="sr-only">{t('generating')}</span>
    </div>
  )
}

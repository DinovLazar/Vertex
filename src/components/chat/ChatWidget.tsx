'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { BotIcon } from './BotIcon'
import { ChatPanel } from './ChatPanel'
import type { ChatMessage as ChatMessageType } from '@/lib/ai'
import type { ChatLocale } from '@/lib/chatWidget'

export function ChatWidget() {
  const pathname = usePathname()
  const locale = useLocale() as ChatLocale
  const t = useTranslations('chat')
  const tGreetings = useTranslations('chat.greetings')

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const userMessageCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages],
  )

  // Build the greeting based on current URL context, once per open-and-empty
  const greeting = useMemo(() => {
    const path = (pathname ?? '/').replace(/^\/(en|mk)/, '') || '/'
    if (path.startsWith('/contact')) return tGreetings('contact')
    if (path.startsWith('/blog')) return tGreetings('blog')
    if (path.startsWith('/consulting')) return tGreetings('consulting')
    if (path.startsWith('/marketing')) return tGreetings('marketing')
    return tGreetings('shared')
  }, [pathname, tGreetings])

  // Seed the conversation with a greeting the first time the panel opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: greeting }])
    }
  }, [open, messages.length, greeting])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Lock body scroll on mobile only (when panel is full-screen)
  useEffect(() => {
    if (!open) return
    const isMobile = window.matchMedia('(max-width: 639px)').matches
    if (!isMobile) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // Cancel any in-flight stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const handleSend = useCallback(
    async (text: string) => {
      setError(null)
      const userMsg: ChatMessageType = { role: 'user', content: text }
      // Optimistically add the user message + an empty assistant placeholder
      const nextMessages: ChatMessageType[] = [
        ...messages,
        userMsg,
        { role: 'assistant', content: '' },
      ]
      setMessages(nextMessages)
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            // Send history WITHOUT the empty placeholder
            messages: [...messages, userMsg].filter(
              (m) => m.content.length > 0,
            ),
            pageUrl: pathname ?? '/',
            locale,
          }),
        })

        if (!resp.ok || !resp.body) {
          throw new Error(`HTTP ${resp.status}`)
        }

        const reader = resp.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          // Append to the last (assistant) message
          setMessages((prev) => {
            const updated = [...prev]
            const lastIndex = updated.length - 1
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = { role: 'assistant', content: accumulated }
            }
            return updated
          })
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        console.error('Chat error:', err)
        setError(t('errors.generic'))
        // Remove the empty assistant placeholder on error
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last?.role === 'assistant' && last.content === '') {
            return prev.slice(0, -1)
          }
          return prev
        })
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [messages, pathname, locale, t],
  )

  // Kill switch
  if (process.env.NEXT_PUBLIC_CHAT_ENABLED === 'false') {
    return null
  }

  return (
    <>
      {/* Trigger — always rendered; hidden visually when panel is open */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('trigger.ariaLabel')}
        aria-expanded={open}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: open ? 0 : 1,
          scale: open ? 0.8 : 1,
          pointerEvents: open ? 'none' : 'auto',
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className={cn(
          'chat-trigger fixed z-50',
          'bottom-6 right-6',
          'flex h-14 w-14 items-center justify-center rounded-full',
          'bg-[var(--color-elevated)] border border-[var(--color-border)]',
          'text-[var(--color-bright)]',
          'shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)]',
          'hover:bg-[var(--color-bright)] hover:text-[var(--color-ink)]',
          'hover:border-[var(--color-bright)]',
          'transition-colors duration-200',
          'focus-ring',
        )}
      >
        <BotIcon className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <ChatPanel
            messages={messages}
            onSend={handleSend}
            onClose={() => setOpen(false)}
            isStreaming={isStreaming}
            error={error}
            userMessageCount={userMessageCount}
          />
        )}
      </AnimatePresence>
    </>
  )
}

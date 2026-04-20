'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { BotIcon, CloseIcon, SendIcon } from './BotIcon'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import type { ChatMessage as ChatMessageType } from '@/lib/ai'

// Client-side cap. Well under the server's 40-message bound.
const MAX_USER_MESSAGES = 20

interface ChatPanelProps {
  messages: ChatMessageType[]
  onSend: (text: string) => void
  onClose: () => void
  isStreaming: boolean
  error: string | null
  userMessageCount: number
}

export function ChatPanel({
  messages,
  onSend,
  onClose,
  isStreaming,
  error,
  userMessageCount,
}: ChatPanelProps) {
  const t = useTranslations('chat')
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const limitReached = userMessageCount >= MAX_USER_MESSAGES

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isStreaming])

  // Auto-focus input when panel opens
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-resize textarea (1–4 rows)
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }, [input])

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || isStreaming || limitReached) return
    onSend(text)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Is the final assistant message currently being streamed?
  const lastMessage = messages[messages.length - 1]
  const lastIsStreamingAssistant =
    isStreaming && lastMessage?.role === 'assistant'
  // Show typing indicator only while waiting for the FIRST chunk. Once the
  // assistant message placeholder has any content, the indicator goes away
  // and the growing bubble takes over.
  const showTypingIndicator =
    isStreaming &&
    (!lastMessage ||
      lastMessage.role === 'user' ||
      (lastMessage.role === 'assistant' && lastMessage.content === ''))

  return (
    <motion.div
      role="dialog"
      aria-modal="false"
      aria-label={t('panel.ariaLabel')}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      style={{ transformOrigin: 'bottom right' }}
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden',
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]',
        // Mobile: full-screen with safe-area insets
        'top-0 right-0 bottom-0 left-0 rounded-none',
        // Desktop: floating panel anchored bottom-right above the trigger.
        // Explicit per-side overrides (not `sm:inset-auto`) because twMerge
        // collapses `sm:inset-auto` with `sm:bottom-24 sm:right-6` as a conflict
        // and drops the specific positions.
        'sm:top-auto sm:left-auto sm:bottom-24 sm:right-6',
        'sm:w-[380px] sm:h-[560px] sm:max-h-[min(560px,calc(100dvh-120px))] sm:rounded-2xl',
      )}
    >
      {/* Header */}
      <header
        className={cn(
          'flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]',
          'bg-[var(--color-elevated)]',
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full',
            'bg-[var(--color-bright)] text-[var(--color-ink)]',
          )}
          aria-hidden="true"
        >
          <BotIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[var(--color-bright)] text-sm font-heading font-semibold leading-tight">
            {t('panel.title')}
          </div>
          <div className="text-[var(--color-muted)] text-xs leading-tight">
            {t('panel.subtitle')}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('panel.close')}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full',
            'text-[var(--color-muted)] hover:text-[var(--color-bright)]',
            'hover:bg-[var(--color-border)] transition-colors',
            'focus-ring',
          )}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1
          return (
            <ChatMessage
              key={i}
              message={m}
              isStreaming={
                isLast && lastIsStreamingAssistant && m.role === 'assistant'
              }
            />
          )
        })}
        {showTypingIndicator && (
          <div className="flex justify-start">
            <div
              className={cn(
                'rounded-2xl rounded-bl-md border border-[var(--color-border)]',
                'bg-[var(--color-elevated)]',
              )}
            >
              <TypingIndicator />
            </div>
          </div>
        )}
        {error && (
          <div
            role="alert"
            className={cn(
              'rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)]',
              'px-3 py-2 text-xs text-[var(--color-muted)]',
            )}
          >
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div
          className={cn(
            'flex items-end gap-2 rounded-xl border border-[var(--color-border)]',
            'bg-[var(--color-elevated)] px-3 py-2',
            'focus-within:border-[var(--color-bright)] focus-within:ring-2 focus-within:ring-[var(--color-bright)]/30',
            'transition-colors',
          )}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              limitReached ? t('errors.messageLimit') : t('input.placeholder')
            }
            disabled={limitReached}
            className={cn(
              'flex-1 resize-none bg-transparent outline-none border-none',
              'text-sm text-[var(--color-bright)] placeholder:text-[var(--color-muted)]',
              'max-h-24 leading-relaxed',
              'disabled:opacity-60',
            )}
            aria-label={t('input.placeholder')}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming || limitReached}
            aria-label={t('input.send')}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              'bg-[var(--color-bright)] text-[var(--color-ink)]',
              'hover:opacity-90 transition-opacity',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-ring',
            )}
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 text-[11px] text-[var(--color-muted)] text-center">
          {t('footer.poweredBy')}
          <a
            href="/contact"
            className="underline hover:text-[var(--color-bright)] transition-colors"
          >
            {t('footer.contactLink')}
          </a>
          {t('footer.period')}
        </div>
      </div>
    </motion.div>
  )
}

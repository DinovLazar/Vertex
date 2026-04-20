'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/lib/ai'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed',
          'whitespace-pre-wrap break-words',
          isUser
            ? 'bg-[var(--color-bright)] text-[var(--color-ink)] rounded-br-md'
            : 'bg-[var(--color-elevated)] text-[var(--color-bright)] border border-[var(--color-border)] rounded-bl-md',
        )}
      >
        {message.content}
        {isStreaming && !isUser && (
          <span
            className="inline-block w-[2px] h-[1em] bg-[var(--color-bright)] ml-0.5 align-middle animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import type { TokenHealth } from '@/lib/meta'

interface Topic {
  _id: string
  title: string
  division: string
  priority: number
  status: string
  failureReason?: string
}

interface LogLine {
  level: 'info' | 'warn' | 'error' | 'done'
  msg?: string
  result?: unknown
  ts?: number
}

export default function GenerateClient({
  topics,
  tokenHealth,
}: {
  topics: Topic[]
  tokenHealth: TokenHealth
}) {
  const [logs, setLogs] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)
  const [publish, setPublish] = useState(false)
  const [postToFacebook, setPostToFacebook] = useState(true)
  const [postToInstagram, setPostToInstagram] = useState(true)

  const pending = topics.filter((t) => t.status === 'pending')
  const used = topics.filter((t) => t.status === 'used')
  const failed = topics.filter((t) => t.status === 'failed')

  async function handleRun() {
    if (running) return
    setRunning(true)
    setLogs([])

    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publish,
          postToFacebook: publish && postToFacebook,
          postToInstagram: publish && postToInstagram,
        }),
      })
      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const obj = JSON.parse(line.slice(6)) as LogLine
              setLogs((prev) => [...prev, obj])
            } catch {
              // ignore malformed line
            }
          }
        }
      }
    } catch (err: unknown) {
      setLogs((prev) => [
        ...prev,
        { level: 'error', msg: err instanceof Error ? err.message : String(err) },
      ])
    } finally {
      setRunning(false)
      // Refresh the page after a brief pause so the topic list picks up the
      // new status (`used` / `failed`) without the user having to reload.
      setTimeout(() => window.location.reload(), 1200)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--division-bg)] text-[var(--division-text-primary)]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold mb-2">Content Generator</h1>
        <p className="text-sm text-[var(--division-text-secondary)] mb-8">
          Picks the highest-priority pending topic, drafts a bilingual blog post with Claude Opus,
          fetches a Pexels image, and saves to Sanity.
        </p>

        {/* Meta token health banner */}
        {tokenHealth.status !== 'ok' && (
          <div
            className={`p-3 mb-6 rounded-lg border text-sm ${
              tokenHealth.status === 'expired'
                ? 'border-[var(--form-error-border)] bg-[var(--form-error-bg)] text-[var(--form-error-text)]'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
            }`}
          >
            <strong>Meta token:</strong> {tokenHealth.message}
            <span className="block text-xs mt-1 opacity-80">
              Social posting will fail until you regenerate the token. See the Phase 13C doc for the regeneration walkthrough.
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Pending" value={pending.length} />
          <StatCard label="Used" value={used.length} />
          <StatCard label="Failed" value={failed.length} />
        </div>

        {/* Run controls */}
        <div className="p-6 bg-[var(--division-surface)] rounded-lg border border-[var(--division-border)] mb-8">
          <div className="mb-4">
            <div className="font-medium">Next topic</div>
            <div className="text-sm text-[var(--division-text-secondary)] mt-1">
              {pending[0] ? (
                <>
                  <span className="text-[var(--division-text-primary)]">{pending[0].title}</span>
                  <span className="ml-2 text-xs">
                    [{pending[0].division}, priority {pending[0].priority}]
                  </span>
                </>
              ) : (
                'No pending topics — add some in Sanity Studio.'
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm mb-2">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              disabled={running}
            />
            <span>Publish immediately (unchecked = save as draft)</span>
          </label>

          <label className="flex items-center gap-2 text-sm mb-2">
            <input
              type="checkbox"
              checked={postToFacebook && publish}
              disabled={running || !publish}
              onChange={(e) => setPostToFacebook(e.target.checked)}
            />
            <span className={publish ? '' : 'text-[var(--division-text-muted)]'}>Post to Facebook</span>
          </label>

          <label className="flex items-center gap-2 text-sm mb-4">
            <input
              type="checkbox"
              checked={postToInstagram && publish}
              disabled={running || !publish}
              onChange={(e) => setPostToInstagram(e.target.checked)}
            />
            <span className={publish ? '' : 'text-[var(--division-text-muted)]'}>Post to Instagram</span>
          </label>

          <button
            onClick={handleRun}
            disabled={running || !pending[0]}
            className="btn-accent px-5 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? 'Running…' : 'Generate next post'}
          </button>
        </div>

        {/* Live log */}
        {logs.length > 0 && (
          <div className="p-4 bg-[var(--division-bg)] rounded-lg border border-[var(--division-border)] font-mono text-xs mb-8 whitespace-pre-wrap break-words">
            {logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.level === 'error'
                    ? 'text-[var(--form-error-text)]'
                    : log.level === 'warn'
                      ? 'text-amber-400'
                      : log.level === 'done'
                        ? 'text-green-400'
                        : 'text-[var(--division-text-secondary)]'
                }
              >
                [{log.level}] {log.msg ?? JSON.stringify(log.result)}
              </div>
            ))}
          </div>
        )}

        {/* Backlog tables */}
        <section className="space-y-8">
          <TopicSection title="Pending (next up first)" topics={pending} />
          {failed.length > 0 && <TopicSection title="Failed" topics={failed} showReason />}
          <TopicSection title="Recently used" topics={used.slice(0, 5)} />
        </section>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-[var(--division-surface)] rounded-lg border border-[var(--division-border)]">
      <div className="text-xs text-[var(--division-text-secondary)] uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function TopicSection({
  title,
  topics,
  showReason,
}: {
  title: string
  topics: Topic[]
  showReason?: boolean
}) {
  if (topics.length === 0) return null
  return (
    <div>
      <h2 className="text-sm uppercase tracking-wider text-[var(--division-text-secondary)] mb-3">{title}</h2>
      <div className="divide-y divide-[var(--division-border)] border border-[var(--division-border)] rounded-lg overflow-hidden">
        {topics.map((t) => (
          <div key={t._id} className="p-3 bg-[var(--division-surface)] text-sm">
            <div className="flex items-center gap-3">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--division-glow)] uppercase tracking-wide">
                {t.division}
              </span>
              <span className="text-xs text-[var(--division-text-secondary)]">p{t.priority}</span>
              <span className="flex-1">{t.title}</span>
            </div>
            {showReason && t.failureReason && (
              <div className="mt-1 text-xs text-[var(--form-error-text)]">{t.failureReason}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

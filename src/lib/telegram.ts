/**
 * Telegram Bot API — push notifications to Goran's phone.
 * Docs: https://core.telegram.org/bots/api
 *
 * Failures are non-fatal — main publish flow always continues.
 */

interface TelegramEnv {
  botToken: string
  chatId: string
}

function loadTelegramEnv(): TelegramEnv {
  const botToken = process.env.VERTEX_TELEGRAM_BOT_TOKEN
  const chatId = process.env.VERTEX_TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    throw new Error(
      'Telegram env vars missing. Check VERTEX_TELEGRAM_BOT_TOKEN and VERTEX_TELEGRAM_CHAT_ID.'
    )
  }
  return { botToken, chatId }
}

export async function sendTelegramMessage(
  text: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { botToken, chatId } = loadTelegramEnv()
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
      cache: 'no-store',
    })
    const json = await res.json()
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.description ?? `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Escape user-provided text for safe embedding in HTML parse_mode messages. */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

import { NextRequest, NextResponse } from 'next/server'
import { resend, resendConfig } from '@/lib/resend'

interface ContactPayload {
  name?: string
  email?: string
  phone?: string
  division?: 'consulting' | 'marketing' | 'both' | ''
  message?: string
  // Honeypot — if filled, it's a bot
  website?: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactPayload = await req.json()

    // Honeypot check — bots tend to fill every field; real humans never see this one.
    if (body.website && body.website.trim() !== '') {
      // Silently succeed so the bot thinks it worked. Don't send email.
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const phone = (body.phone || '').trim()
    const division = body.division || ''
    const message = (body.message || '').trim()

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!message || message.length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
    }

    const divisionLabel: Record<string, string> = {
      consulting: 'Consulting',
      marketing: 'Marketing',
      both: 'Both divisions',
      '': 'Not specified',
    }

    const subject = `New contact form submission — ${name}`

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
        <div style="background: #0A0B12; color: #F1F3F7; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 18px; font-weight: 600;">New contact form submission</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #9AA0AD;">Vertex Consulting website</p>
        </div>
        <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #666; width: 120px;">Name</td><td style="padding: 6px 0;"><strong>${escapeHtml(name)}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            ${phone ? `<tr><td style="padding: 6px 0; color: #666;">Phone</td><td style="padding: 6px 0;">${escapeHtml(phone)}</td></tr>` : ''}
            <tr><td style="padding: 6px 0; color: #666;">Interested in</td><td style="padding: 6px 0;">${escapeHtml(divisionLabel[division] || 'Not specified')}</td></tr>
          </table>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            <div style="color: #666; font-size: 13px; margin-bottom: 8px;">Message</div>
            <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${escapeHtml(message)}</div>
          </div>
          <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #999; font-size: 12px;">
            Reply directly to this email to respond — your reply will go to ${escapeHtml(email)}.
          </p>
        </div>
      </div>
    `

    const text = `New contact form submission

Name: ${name}
Email: ${email}${phone ? `\nPhone: ${phone}` : ''}
Interested in: ${divisionLabel[division] || 'Not specified'}

Message:
${message}

---
Reply directly to this email — it will go to ${email}.`

    const { error } = await resend.emails.send({
      from: `Vertex Website <${resendConfig.from}>`,
      to: resendConfig.contactTo,
      replyTo: email,
      subject,
      html,
      text,
    })

    if (error) {
      console.error('[contact] Resend error:', error)
      return NextResponse.json(
        { error: 'Could not send message. Please email us directly at info@vertexconsulting.mk.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] unexpected error:', err)
    return NextResponse.json(
      { error: 'Unexpected error. Please try again or email info@vertexconsulting.mk.' },
      { status: 500 }
    )
  }
}

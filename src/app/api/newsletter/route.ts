import { NextRequest, NextResponse } from 'next/server'
import { resend, resendConfig } from '@/lib/resend'

interface NewsletterPayload {
  email?: string
  // Honeypot
  website?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const body: NewsletterPayload = await req.json()

    if (body.website && body.website.trim() !== '') {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const email = (body.email || '').trim().toLowerCase()

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (!resendConfig.audienceId) {
      console.error('[newsletter] RESEND_AUDIENCE_ID not configured')
      return NextResponse.json({ error: 'Newsletter is temporarily unavailable.' }, { status: 500 })
    }

    // Add to Resend Audience. Duplicates return an error — treat as success to avoid leaking membership.
    const { error: contactError } = await resend.contacts.create({
      email,
      audienceId: resendConfig.audienceId,
      unsubscribed: false,
    })

    if (contactError) {
      console.warn('[newsletter] contacts.create warning (may be duplicate):', contactError)
    }

    const welcomeHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
        <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">Welcome to the Vertex newsletter</h1>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Thanks for subscribing. Once a month you'll get insights on business strategy, operations, and digital marketing — written for business owners in Macedonia and beyond. No fluff, no spam, no sales pressure.
        </p>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          If the first issue doesn't land well, you can unsubscribe with one click from the bottom of any email.
        </p>
        <p style="font-size: 15px; line-height: 1.6; margin: 24px 0 0;">
          — Goran Dinov<br />
          <span style="color: #666;">Vertex Consulting &nbsp;·&nbsp; Strumica, Macedonia</span>
        </p>
      </div>
    `

    const { error: welcomeError } = await resend.emails.send({
      from: `Vertex Consulting <${resendConfig.from}>`,
      to: email,
      subject: 'Welcome to the Vertex newsletter',
      html: welcomeHtml,
      text: `Welcome to the Vertex newsletter.

Thanks for subscribing. Once a month you'll get insights on business strategy, operations, and digital marketing — written for business owners in Macedonia and beyond. No fluff, no spam, no sales pressure.

If the first issue doesn't land well, you can unsubscribe with one click from the bottom of any email.

— Goran Dinov
Vertex Consulting · Strumica, Macedonia`,
    })

    if (welcomeError) {
      console.error('[newsletter] welcome email error:', welcomeError)
      // Don't fail the whole request — the contact was still added to the audience.
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[newsletter] unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('[resend] RESEND_API_KEY is not set — emails will fail')
}

// The current Resend SDK throws ("Missing API key") the moment `new Resend('')`
// runs, so instantiating at module load breaks `next build`'s page-data
// collection whenever no env is present (e.g. a local build without
// `.env.local`). Instantiate lazily instead: the client is created on first
// actual use, so simply importing this module — as the build does when it walks
// the API routes — never throws. A genuinely missing key then surfaces as a
// caught runtime error inside the route handler, keeping the graceful-
// degradation invariant ("next build survives without env vars") intact.
let client: Resend | null = null

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    if (!client) client = new Resend(process.env.RESEND_API_KEY || '')
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export const resendConfig = {
  from: process.env.RESEND_FROM_EMAIL || 'info@vertexconsulting.mk',
  audienceId: process.env.RESEND_AUDIENCE_ID || '',
} as const

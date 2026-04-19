import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('[resend] RESEND_API_KEY is not set — emails will fail')
}

export const resend = new Resend(process.env.RESEND_API_KEY || '')

export const resendConfig = {
  from: process.env.RESEND_FROM_EMAIL || 'info@vertexconsulting.mk',
  contactTo: process.env.CONTACT_TO_EMAIL || 'vertexcons1@gmail.com',
  audienceId: process.env.RESEND_AUDIENCE_ID || '',
} as const

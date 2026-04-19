'use client'

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AnimateIn } from '@/components/global'
import { Button } from '@/components/ui/button'
import { Loader2, Check } from 'lucide-react'

interface FormData {
  name: string
  email: string
  phone: string
  division: 'consulting' | 'marketing' | 'both' | ''
  message: string
  website: string // honeypot — hidden from real users
}

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>

export default function ContactForm() {
  const t = useTranslations('contact.form')
  const uniqueId = useId()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    division: '',
    message: '',
    website: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const nameErrorId = `${uniqueId}-name-error`
  const emailErrorId = `${uniqueId}-email-error`
  const messageErrorId = `${uniqueId}-message-error`
  const submitErrorId = `${uniqueId}-submit-error`

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => {
      if (!prev[name as keyof FieldErrors]) return prev
      const next = { ...prev }
      delete next[name as keyof FieldErrors]
      return next
    })
  }

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {}
    if (!formData.name.trim()) errors.name = t('nameError')
    if (!formData.email.trim()) errors.email = t('emailErrorRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = t('emailErrorInvalid')
    if (!formData.message.trim() || formData.message.trim().length < 10)
      errors.message = t('messageError')
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('')
      // Move focus to the first invalid field so screen readers announce it.
      const firstInvalid = (['name', 'email', 'message'] as const).find(
        (k) => errors[k]
      )
      if (firstInvalid) {
        const el = document.getElementById(`${uniqueId}-${firstInvalid}`)
        el?.focus()
      }
      return
    }

    setFieldErrors({})
    setStatus('submitting')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || t('genericError'))
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : t('genericError'))
    }
  }

  if (status === 'success') {
    return (
      <AnimateIn>
        <div className="rounded-card border border-[var(--division-border)] bg-[var(--division-card)] p-8 text-center">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-[var(--division-accent)]/20">
            <Check size={28} className="text-[var(--division-accent)]" aria-hidden="true" />
          </div>
          <h3 className="text-h3 text-[var(--division-text-primary)]">
            {t('successTitle')}
          </h3>
          <p className="mt-2 text-small text-[var(--division-text-secondary)]">
            {t('successMessage')}
          </p>
        </div>
      </AnimateIn>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot — real users never see or fill this. Bots do. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <label htmlFor="website">{t('honeypotLabel')}</label>
        <input
          type="text"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor={`${uniqueId}-name`}
          className="block overline text-[var(--division-text-muted)] mb-2"
        >
          {t('nameLabel')}
        </label>
        <input
          type="text"
          id={`${uniqueId}-name`}
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? nameErrorId : undefined}
          className="w-full px-4 py-3 rounded-button bg-[var(--division-surface)] border border-[var(--division-border)] text-[var(--division-text-primary)] placeholder:text-[var(--division-text-muted)] form-input-focus"
          placeholder={t('namePlaceholder')}
        />
        {fieldErrors.name && (
          <p id={nameErrorId} role="alert" className="mt-2 text-micro text-red-400">
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email + Phone in 2-col on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor={`${uniqueId}-email`}
            className="block overline text-[var(--division-text-muted)] mb-2"
          >
            {t('emailLabel')}
          </label>
          <input
            type="email"
            id={`${uniqueId}-email`}
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? emailErrorId : undefined}
            className="w-full px-4 py-3 rounded-button bg-[var(--division-surface)] border border-[var(--division-border)] text-[var(--division-text-primary)] placeholder:text-[var(--division-text-muted)] form-input-focus"
            placeholder={t('emailPlaceholder')}
          />
          {fieldErrors.email && (
            <p id={emailErrorId} role="alert" className="mt-2 text-micro text-red-400">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor={`${uniqueId}-phone`}
            className="block overline text-[var(--division-text-muted)] mb-2"
          >
            {t('phoneLabel')}
          </label>
          <input
            type="tel"
            id={`${uniqueId}-phone`}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-button bg-[var(--division-surface)] border border-[var(--division-border)] text-[var(--division-text-primary)] placeholder:text-[var(--division-text-muted)] form-input-focus"
            placeholder={t('phonePlaceholder')}
          />
        </div>
      </div>

      {/* Division */}
      <div>
        <label
          htmlFor={`${uniqueId}-division`}
          className="block overline text-[var(--division-text-muted)] mb-2"
        >
          {t('divisionLabel')}
        </label>
        <select
          id={`${uniqueId}-division`}
          name="division"
          value={formData.division}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-button bg-[var(--division-surface)] border border-[var(--division-border)] text-[var(--division-text-primary)] form-input-focus appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236E6D7A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '2.5rem',
          }}
        >
          <option value="">{t('divisionOptions.unsure')}</option>
          <option value="consulting">{t('divisionOptions.consulting')}</option>
          <option value="marketing">{t('divisionOptions.marketing')}</option>
          <option value="both">{t('divisionOptions.both')}</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor={`${uniqueId}-message`}
          className="block overline text-[var(--division-text-muted)] mb-2"
        >
          {t('messageLabel')}
        </label>
        <textarea
          id={`${uniqueId}-message`}
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? messageErrorId : undefined}
          className="w-full px-4 py-3 rounded-button bg-[var(--division-surface)] border border-[var(--division-border)] text-[var(--division-text-primary)] placeholder:text-[var(--division-text-muted)] form-input-focus resize-none"
          placeholder={t('messagePlaceholder')}
        />
        {fieldErrors.message && (
          <p id={messageErrorId} role="alert" className="mt-2 text-micro text-red-400">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Submission-level error (API / network) */}
      {error && (
        <div
          id={submitErrorId}
          role="alert"
          className="text-small text-red-400 bg-red-500/10 border border-red-500/20 rounded-button px-4 py-3"
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="cta"
        disabled={status === 'submitting'}
        aria-busy={status === 'submitting'}
        aria-describedby={error ? submitErrorId : undefined}
        className="w-full md:w-auto hover:brightness-110"
        style={{
          backgroundColor: 'var(--division-accent)',
          color: 'var(--division-bg)',
        }}
      >
        {status === 'submitting' ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </Button>

      <p className="text-micro text-[var(--division-text-muted)]">
        {t('privacyNotice')}
      </p>
    </form>
  )
}

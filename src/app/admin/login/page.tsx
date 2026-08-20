import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function loginAction(formData: FormData) {
  'use server'
  const password = String(formData.get('password') ?? '')
  if (password !== process.env.VERTEX_ADMIN_PASSWORD) {
    redirect('/admin/login?error=1')
  }
  const cookieStore = await cookies()
  cookieStore.set('vertex-admin', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  redirect('/admin/generate')
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--division-bg)] text-[var(--division-text-primary)]">
      <form
        action={loginAction}
        className="w-full max-w-sm p-8 bg-[var(--division-surface)] rounded-xl border border-[var(--division-border)]"
      >
        <h1 className="text-xl font-semibold mb-6">Vertex Admin</h1>
        <label htmlFor="vertex-admin-password" className="sr-only">
          Password
        </label>
        <input
          id="vertex-admin-password"
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          autoComplete="current-password"
          aria-invalid={sp.error ? true : undefined}
          /* A wrong password server-redirects to ?error=1, so the message is
             already in the DOM at first paint. role="alert" only announces
             *changes* to a live region, so on a fresh document load it says
             nothing — and the message sits after the input, where the
             autofocused field never reaches it. Wiring it up with
             aria-describedby means the error is read out as part of the
             field that has focus on arrival (WCAG 3.3.1). */
          aria-describedby={sp.error ? 'vertex-admin-password-error' : undefined}
          /* --division-border is 1.78:1 on --division-bg in dark mode; the
             field's only affordance has to clear 3:1 (WCAG 1.4.11), which is
             what --input-border is for. */
          className="w-full px-4 py-3 rounded-lg bg-[var(--division-bg)] border border-[var(--input-border)] text-[var(--division-text-primary)] form-input-focus"
        />
        {sp.error && (
          <p
            id="vertex-admin-password-error"
            className="mt-3 text-sm text-[var(--form-error-text)]"
            role="alert"
          >
            Wrong password.
          </p>
        )}
        <button
          type="submit"
          className="btn-accent w-full mt-4 px-4 py-3 rounded-lg font-medium"
        >
          Sign in
        </button>
      </form>
    </main>
  )
}

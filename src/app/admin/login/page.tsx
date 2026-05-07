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
          className="w-full px-4 py-3 rounded-lg bg-[var(--division-bg)] border border-[var(--division-border)] text-[var(--division-text-primary)] form-input-focus"
        />
        {sp.error && (
          <p className="mt-3 text-sm text-[var(--color-accent-error)]" role="alert">
            Wrong password.
          </p>
        )}
        <button
          type="submit"
          className="w-full mt-4 px-4 py-3 rounded-lg bg-[var(--division-accent)] text-[var(--division-bg)] font-medium hover:brightness-110 transition-all"
        >
          Sign in
        </button>
      </form>
    </main>
  )
}

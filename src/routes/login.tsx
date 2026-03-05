import { FormEvent, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { signInWithPassword } from '@/lib/supabase/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signInWithPassword(email, password)
      window.location.href = '/products'
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto mt-20 w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <h1 className="mb-6 text-xl font-semibold">Sign in to URU</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          Email
          <input
            className="mt-2 w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="block text-sm">
          Password
          <input
            className="mt-2 w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}

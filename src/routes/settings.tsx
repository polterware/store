import { FormEvent, useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { AppSettingsRepository } from '@/lib/db/repositories'
import { getUser, getUserRoles } from '@/lib/supabase/auth'

export const Route = createFileRoute('/settings')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: SettingsPage,
})

function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [settingKey, setSettingKey] = useState('dashboard.default_range')
  const [settingValue, setSettingValue] = useState('{"days":30}')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadIdentity() {
      try {
        const user = await getUser()
        if (!user) {
          window.location.href = '/login'
          return
        }

        const userRoles = await getUserRoles(user.id)

        if (!ignore) {
          setUserEmail(user.email ?? null)
          setRoles(userRoles)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load profile')
        }
      }
    }

    void loadIdentity()

    return () => {
      ignore = true
    }
  }, [])

  async function onSaveSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)

    try {
      const user = await getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const parsed = JSON.parse(settingValue)
      await AppSettingsRepository.upsert(user.id, settingKey, parsed)
      setMessage('Setting saved via Supabase')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save setting')
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-neutral-400">Session and role-driven settings for the Dost-focused manager.</p>
      </header>

      <div className="rounded border border-neutral-800 bg-neutral-900 p-4 text-sm">
        <p>User: {userEmail ?? 'Unknown'}</p>
        <p>Roles: {roles.length ? roles.join(', ') : 'No roles found'}</p>
      </div>

      <form className="space-y-3 rounded border border-neutral-800 bg-neutral-900 p-4" onSubmit={onSaveSetting}>
        <label className="block text-sm">
          Key
          <input
            className="mt-2 w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
            value={settingKey}
            onChange={(event) => setSettingKey(event.target.value)}
          />
        </label>

        <label className="block text-sm">
          JSON Value
          <textarea
            className="mt-2 min-h-24 w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-xs"
            value={settingValue}
            onChange={(event) => setSettingValue(event.target.value)}
          />
        </label>

        <button type="submit" className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500">
          Save setting
        </button>

        {message ? <p className="text-emerald-400">{message}</p> : null}
        {error ? <p className="text-red-400">{error}</p> : null}
      </form>
    </section>
  )
}

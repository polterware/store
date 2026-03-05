import { text, isCancel, confirm } from '@clack/prompts'
import pc from 'picocolors'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const ENV_PATH = '.env.local'

const REQUIRED_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
] as const

export function envExists(): boolean {
  return existsSync(ENV_PATH)
}

export function readEnv(): Record<string, string> {
  if (!envExists()) return {}
  const content = readFileSync(ENV_PATH, 'utf-8')
  const env: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    env[key] = val
  }
  return env
}

export function validateEnv(): { ok: boolean; missing: string[] } {
  const env = readEnv()
  const missing = REQUIRED_KEYS.filter((k) => !env[k])
  return { ok: missing.length === 0, missing }
}

export async function ensureEnv(): Promise<boolean> {
  const env = readEnv()
  const missing = REQUIRED_KEYS.filter((k) => !env[k])

  if (missing.length === 0) return true

  if (envExists()) {
    console.log(pc.yellow(`  .env.local exists but is missing: ${missing.join(', ')}`))
  } else {
    console.log(pc.yellow('  .env.local not found — let\'s create it'))
  }

  const updates: Record<string, string> = {}

  for (const key of missing) {
    const hint =
      key === 'VITE_SUPABASE_URL'
        ? 'https://YOUR_PROJECT_REF.supabase.co'
        : 'your-publishable-key'

    const value = await text({
      message: `Enter ${pc.bold(key)}`,
      placeholder: hint,
      validate: (v) => (!v.trim() ? 'Required' : undefined),
    })

    if (isCancel(value)) return false
    updates[key] = value as string
  }

  const merged = { ...env, ...updates }
  const content = Object.entries(merged)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  writeFileSync(ENV_PATH, content + '\n')
  console.log(pc.green('  .env.local saved'))
  return true
}

import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'
import type { AppRole } from '@/types/domain'

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    handleSupabaseError(error)
  }

  return data.session
}

export async function getUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    handleSupabaseError(error)
  }

  return data
}

export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    handleSupabaseError(error)
  }
}

export async function getUserRoles(userId: string): Promise<AppRole[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('user_roles')
    .select('roles(code)')
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (error) {
    handleSupabaseError(error)
  }

  const rows = (data ?? []) as Array<{ roles: { code: AppRole } | { code: AppRole }[] | null }>

  return rows
    .flatMap((row) => {
      if (!row.roles) {
        return []
      }

      return Array.isArray(row.roles) ? row.roles : [row.roles]
    })
    .map((role) => role.code)
}

export async function assertAuthenticated() {
  const session = await getSession()
  if (!session) {
    throw new Error('User is not authenticated')
  }
  return session
}

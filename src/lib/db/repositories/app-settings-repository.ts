import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'
import type { Json } from '@/types/database'

export const AppSettingsRepository = {
  async list() {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .is('deleted_at', null)
      .order('key', { ascending: true })

    if (error) {
      handleSupabaseError(error)
    }

    return data ?? []
  },

  async upsert(ownerUserId: string, key: string, value: Json) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(
        {
          owner_user_id: ownerUserId,
          key,
          value,
          updated_at: new Date().toISOString(),
          deleted_at: null,
          lifecycle_status: 'active',
        },
        {
          onConflict: 'owner_user_id,key',
          ignoreDuplicates: false,
        },
      )
      .select('*')
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return data
  },
}

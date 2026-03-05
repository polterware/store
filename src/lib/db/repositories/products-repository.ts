import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'
import type { Product, ProductInsert, ProductUpdate } from '@/types/domain'

export const ProductsRepository = {
  async list(): Promise<Product[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return data ?? []
  },

  async create(payload: ProductInsert): Promise<Product> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('products').insert(payload).select('*').single()

    if (error) {
      handleSupabaseError(error)
    }

    return data
  },

  async update(id: string, payload: ProductUpdate): Promise<Product> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return data
  },

  async archive(id: string): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString(), lifecycle_status: 'archived' })
      .eq('id', id)
      .is('deleted_at', null)

    if (error) {
      handleSupabaseError(error)
    }
  },
}

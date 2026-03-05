export class SupabaseRequestError extends Error {
  code: string | null
  details: string | null
  hint: string | null
  status: number | null

  constructor(message: string, options?: { code?: string | null; details?: string | null; hint?: string | null; status?: number | null }) {
    super(message)
    this.name = 'SupabaseRequestError'
    this.code = options?.code ?? null
    this.details = options?.details ?? null
    this.hint = options?.hint ?? null
    this.status = options?.status ?? null
  }
}

export function handleSupabaseError(error: unknown): never {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message: unknown }).message)
    throw new SupabaseRequestError(message, {
      code: 'code' in (error as Record<string, unknown>) ? String((error as Record<string, unknown>).code ?? '') : null,
      details: 'details' in (error as Record<string, unknown>) ? String((error as Record<string, unknown>).details ?? '') : null,
      hint: 'hint' in (error as Record<string, unknown>) ? String((error as Record<string, unknown>).hint ?? '') : null,
      status: 'status' in (error as Record<string, unknown>) ? Number((error as Record<string, unknown>).status ?? 0) : null,
    })
  }

  throw new SupabaseRequestError('Unexpected Supabase error')
}

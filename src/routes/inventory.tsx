import { createFileRoute, redirect } from '@tanstack/react-router'

import { getUser } from '@/lib/supabase/auth'

export const Route = createFileRoute('/inventory')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }

    throw redirect({ to: '/tables/$table', params: { table: 'inventory_levels' } })
  },
  component: InventoryRedirectPage,
})

function InventoryRedirectPage() {
  return null
}

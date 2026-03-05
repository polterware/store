import { createFileRoute, redirect } from '@tanstack/react-router'

import { getUser } from '@/lib/supabase/auth'

export const Route = createFileRoute('/orders')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }

    throw redirect({ to: '/tables/$table', params: { table: 'orders' } })
  },
  component: OrdersRedirectPage,
})

function OrdersRedirectPage() {
  return null
}

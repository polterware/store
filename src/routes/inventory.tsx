import { useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getUser } from '@/lib/supabase/auth'
import { InventoryLevelsRepository } from '@/lib/db/repositories'
import type { InventoryLevel } from '@/types/domain'

export const Route = createFileRoute('/inventory')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: InventoryPage,
})

function InventoryPage() {
  const [levels, setLevels] = useState<InventoryLevel[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadInventory() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await InventoryLevelsRepository.list()
        if (!ignore) {
          setLevels(data)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load inventory')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadInventory()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-muted-foreground">Live inventory levels sourced only from Supabase.</p>
      </header>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inventory level</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={5}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : levels.length === 0 ? (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={5}>
                    No inventory levels yet.
                  </TableCell>
                </TableRow>
              ) : (
                levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell>{level.id.slice(0, 8)}</TableCell>
                    <TableCell>{level.quantity_on_hand}</TableCell>
                    <TableCell>{level.quantity_reserved}</TableCell>
                    <TableCell>{level.quantity_available}</TableCell>
                    <TableCell>{new Date(level.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}

import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import type { Product } from '@/types/domain'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getUser } from '@/lib/supabase/auth'
import { ProductsRepository } from '@/lib/db/repositories'

export const Route = createFileRoute('/products')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: ProductsPage,
})

function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Array<Product>>([])
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('0')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function loadProducts() {
    setIsLoading(true)
    setError(null)

    try {
      const data = await ProductsRepository.list()
      setProducts(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load products')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  async function onCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const user = await getUser()
    if (!user) {
      await navigate({ to: '/login' })
      return
    }

    try {
      await ProductsRepository.create({
        title,
        sku,
        price: Number(price),
        created_by: user.id,
      })

      setTitle('')
      setSku('')
      setPrice('0')
      await loadProducts()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create product')
    }
  }

  const totalSkus = useMemo(() => products.length, [products])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-muted-foreground">Supabase-only catalog management. Active SKUs: {totalSkus}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>New Product</CardTitle>
          <CardDescription>Create a product using the default catalog fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={onCreateProduct}>
            <div className="space-y-2">
              <Label htmlFor="product-title">Title</Label>
              <Input
                id="product-title"
                placeholder="Product title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                placeholder="SKU"
                required
                value={sku}
                onChange={(event) => setSku(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price</Label>
              <Input
                id="product-price"
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Add product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={4}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={4}>
                    No products yet.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell className="capitalize">{product.lifecycle_status}</TableCell>
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

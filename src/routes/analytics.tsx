import { useCallback, useEffect, useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import type { AnalyticsDashboardData, AnalyticsRangeKey } from '@/types/analytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ANALYTICS_RANGE_OPTIONS, DEFAULT_ANALYTICS_RANGE } from '@/lib/analytics/analytics-range'
import { AnalyticsDashboardRepository } from '@/lib/db/repositories'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { getUser } from '@/lib/supabase/auth'

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  authorized: 'Authorized',
  captured: 'Captured',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const CHECKOUT_STAGE_LABELS: Record<string, string> = {
  opened: 'Opened',
  completed: 'Completed',
  expired: 'Expired',
  abandoned: 'Abandoned',
}

const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat('pt-BR')
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const salesTrendChartConfig = {
  gross_sales: {
    label: 'Gross sales',
    color: 'var(--chart-1)',
  },
  net_sales: {
    label: 'Net sales',
    color: 'var(--chart-2)',
  },
} as const

const salesStatusChartConfig = {
  orders_count: {
    label: 'Orders',
    color: 'var(--chart-1)',
  },
} as const

const paymentsStatusChartConfig = {
  total_amount: {
    label: 'Amount',
    color: 'var(--chart-3)',
  },
} as const

const checkoutFunnelChartConfig = {
  sessions_count: {
    label: 'Sessions',
    color: 'var(--chart-2)',
  },
} as const

const checkoutCompletionChartConfig = {
  completion_rate: {
    label: 'Completion rate',
    color: 'var(--chart-4)',
  },
  completed_amount: {
    label: 'Completed revenue',
    color: 'var(--chart-1)',
  },
} as const

const inventoryMovementChartConfig = {
  inbound_qty: {
    label: 'Inbound',
    color: 'var(--chart-2)',
  },
  outbound_qty: {
    label: 'Outbound',
    color: 'var(--chart-1)',
  },
  reservation_qty: {
    label: 'Reservation',
    color: 'var(--chart-4)',
  },
  release_qty: {
    label: 'Release',
    color: 'var(--chart-3)',
  },
} as const

const productRevenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-2)',
  },
} as const

const productConversionChartConfig = {
  view_to_cart_rate: {
    label: 'View -> Cart',
    color: 'var(--chart-3)',
  },
  cart_to_sale_rate: {
    label: 'Cart -> Sale',
    color: 'var(--chart-4)',
  },
} as const

const operationsChartConfig = {
  count: {
    label: 'Inquiries',
    color: 'var(--chart-1)',
  },
} as const

export const Route = createFileRoute('/analytics')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: AnalyticsPage,
})

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return percentFormatter.format(0)
  }

  return percentFormatter.format(value)
}

function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(Number.isFinite(value) ? value : 0)
}

function formatInteger(value: number): string {
  return integerFormatter.format(Number.isFinite(value) ? value : 0)
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">Partial data for this domain: {message}</p>
}

function EmptyChart({ message }: { message: string }) {
  return <p className="text-muted-foreground text-sm">{message}</p>
}

function AnalyticsPage() {
  const [rangeKey, setRangeKey] = useState<AnalyticsRangeKey>(DEFAULT_ANALYTICS_RANGE)
  const [dashboard, setDashboard] = useState<AnalyticsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async (targetRange: AnalyticsRangeKey) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await AnalyticsDashboardRepository.loadDashboard(targetRange)
      setDashboard(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load the analytics dashboard.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboard(rangeKey)
  }, [rangeKey, loadDashboard])

  const salesOverview = dashboard?.sales.data.overview
  const paymentsOverview = dashboard?.payments.data.overview
  const inventoryOverview = dashboard?.inventory.data.overview
  const operationsOverview = dashboard?.operations.data.overview

  const salesTrendData = useMemo(() => {
    return (dashboard?.sales.data.timeseries ?? []).map((row) => ({
      ...row,
      label: formatDate(row.bucket_date),
    }))
  }, [dashboard])

  const salesStatusData = useMemo(() => {
    return (dashboard?.sales.data.statusBreakdown ?? []).map((row) => ({
      ...row,
      status_label: ORDER_STATUS_LABELS[row.status] ?? row.status,
    }))
  }, [dashboard])

  const paymentsStatusData = useMemo(() => {
    return (dashboard?.payments.data.statusBreakdown ?? []).map((row) => ({
      ...row,
      status_label: PAYMENT_STATUS_LABELS[row.status] ?? row.status,
    }))
  }, [dashboard])

  const checkoutFunnelData = useMemo(() => {
    return (dashboard?.checkout.data.funnel ?? []).map((row) => ({
      ...row,
      stage_label: CHECKOUT_STAGE_LABELS[row.stage] ?? row.stage,
    }))
  }, [dashboard])

  const checkoutTimeseriesData = useMemo(() => {
    return (dashboard?.checkout.data.timeseries ?? []).map((row) => ({
      ...row,
      label: formatDate(row.bucket_date),
    }))
  }, [dashboard])

  const inventoryMovementData = useMemo(() => {
    return (dashboard?.inventory.data.movementsTimeseries ?? []).map((row) => ({
      ...row,
      label: formatDate(row.bucket_date),
    }))
  }, [dashboard])

  const topRevenueData = useMemo(() => {
    return (dashboard?.products.data.topRevenue ?? []).map((row) => ({
      ...row,
      label: row.sku,
    }))
  }, [dashboard])

  const productsConversionData = useMemo(() => {
    return (dashboard?.products.data.conversion ?? []).map((row) => ({
      ...row,
      label: row.sku,
    }))
  }, [dashboard])

  const operationsData = useMemo(() => {
    const overview = dashboard?.operations.data.overview
    if (!overview) {
      return []
    }

    return [
      { label: 'Open', count: overview.open_inquiries_count },
      { label: 'Pending', count: overview.pending_inquiries_count },
      { label: 'Resolved', count: overview.resolved_inquiries_count },
    ]
  }, [dashboard])

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Executive monitoring for sales, payments, checkout, inventory, products, and operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={rangeKey} onValueChange={(value) => setRangeKey(value as AnalyticsRangeKey)}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {ANALYTICS_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="button" variant="outline" disabled={isLoading} onClick={() => void loadDashboard(rangeKey)}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </header>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net sales</CardDescription>
            <CardTitle>{formatCurrency(salesOverview?.net_sales ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Gross: {formatCurrency(salesOverview?.gross_sales ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Orders</CardDescription>
            <CardTitle>{formatInteger(salesOverview?.orders_count ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Cancellation: {formatPercent(salesOverview?.cancellation_rate ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average ticket</CardDescription>
            <CardTitle>{formatCurrency(salesOverview?.avg_ticket ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Paid orders: {formatInteger(salesOverview?.paid_orders_count ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payment success</CardDescription>
            <CardTitle>{formatPercent(paymentsOverview?.payment_success_rate ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Captured: {formatCurrency(paymentsOverview?.captured_amount ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low-stock SKUs</CardDescription>
            <CardTitle>{formatInteger(inventoryOverview?.low_stock_skus ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Out of stock: {formatInteger(inventoryOverview?.out_of_stock_skus ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open inquiries</CardDescription>
            <CardTitle>{formatInteger(operationsOverview?.open_inquiries_count ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Pending reviews: {formatInteger(operationsOverview?.pending_reviews_count ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <ErrorBanner message={dashboard?.sales.error ?? null} />

          <Card>
            <CardHeader>
              <CardTitle>Revenue over time</CardTitle>
              <CardDescription>Gross vs net sales by period.</CardDescription>
            </CardHeader>
            <CardContent>
              {salesTrendData.length === 0 ? (
                <EmptyChart message="No sales data for the selected period." />
              ) : (
                <ChartContainer config={salesTrendChartConfig} className="h-[280px] w-full">
                  <AreaChart data={salesTrendData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
                    <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} width={88} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="gross_sales" stroke="var(--color-gross_sales)" fill="var(--color-gross_sales)" fillOpacity={0.14} />
                    <Area type="monotone" dataKey="net_sales" stroke="var(--color-net_sales)" fill="var(--color-net_sales)" fillOpacity={0.28} />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders by status</CardTitle>
              <CardDescription>Operational distribution of orders.</CardDescription>
            </CardHeader>
            <CardContent>
              {salesStatusData.length === 0 ? (
                <EmptyChart message="No orders in the selected period." />
              ) : (
                <ChartContainer config={salesStatusChartConfig} className="h-[260px] w-full">
                  <BarChart data={salesStatusData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="status_label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="orders_count" fill="var(--color-orders_count)" radius={6} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <ErrorBanner message={dashboard?.payments.error ?? null} />

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Captured</CardDescription>
                <CardTitle>{formatCurrency(paymentsOverview?.captured_amount ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Failures</CardDescription>
                <CardTitle>{formatCurrency(paymentsOverview?.failed_amount ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Refunds</CardDescription>
                <CardTitle>{formatCurrency(paymentsOverview?.refunded_amount ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment status</CardTitle>
              <CardDescription>Financial amount by status.</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsStatusData.length === 0 ? (
                <EmptyChart message="No payments in the selected period." />
              ) : (
                <ChartContainer config={paymentsStatusChartConfig} className="h-[280px] w-full">
                  <BarChart data={paymentsStatusData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="status_label" tickLine={false} axisLine={false} minTickGap={18} />
                    <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} width={88} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="total_amount" fill="var(--color-total_amount)" radius={6} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <ErrorBanner message={dashboard?.checkout.error ?? null} />

          <Card>
            <CardHeader>
              <CardTitle>Checkout funnel</CardTitle>
              <CardDescription>Sessions by funnel stage.</CardDescription>
            </CardHeader>
            <CardContent>
              {checkoutFunnelData.length === 0 ? (
                <EmptyChart message="No checkout sessions in the selected period." />
              ) : (
                <ChartContainer config={checkoutFunnelChartConfig} className="h-[260px] w-full">
                  <BarChart data={checkoutFunnelData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="stage_label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="sessions_count" fill="var(--color-sessions_count)" radius={6} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completion rate over time</CardTitle>
              <CardDescription>Checkout conversion and completed amount.</CardDescription>
            </CardHeader>
            <CardContent>
              {checkoutTimeseriesData.length === 0 ? (
                <EmptyChart message="No checkout timeseries in the selected period." />
              ) : (
                <ChartContainer config={checkoutCompletionChartConfig} className="h-[280px] w-full">
                  <LineChart data={checkoutTimeseriesData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis yAxisId="rate" domain={[0, 1]} tickFormatter={(value) => formatPercent(Number(value))} width={82} />
                    <YAxis yAxisId="amount" orientation="right" tickFormatter={(value) => formatCompactCurrency(Number(value))} width={82} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line yAxisId="rate" dataKey="completion_rate" type="monotone" stroke="var(--color-completion_rate)" strokeWidth={2} dot={false} />
                    <Line yAxisId="amount" dataKey="completed_amount" type="monotone" stroke="var(--color-completed_amount)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <ErrorBanner message={dashboard?.inventory.error ?? null} />

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total SKUs</CardDescription>
                <CardTitle>{formatInteger(inventoryOverview?.total_skus ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Available units</CardDescription>
                <CardTitle>{formatInteger(inventoryOverview?.total_available_units ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Reserved units</CardDescription>
                <CardTitle>{formatInteger(inventoryOverview?.total_reserved_units ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory movements</CardTitle>
              <CardDescription>Inbound, outbound, reservation, and release by period.</CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryMovementData.length === 0 ? (
                <EmptyChart message="No movements in the selected period." />
              ) : (
                <ChartContainer config={inventoryMovementChartConfig} className="h-[280px] w-full">
                  <LineChart data={inventoryMovementData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line dataKey="inbound_qty" type="monotone" stroke="var(--color-inbound_qty)" strokeWidth={2} dot={false} />
                    <Line dataKey="outbound_qty" type="monotone" stroke="var(--color-outbound_qty)" strokeWidth={2} dot={false} />
                    <Line dataKey="reservation_qty" type="monotone" stroke="var(--color-reservation_qty)" strokeWidth={2} dot={false} />
                    <Line dataKey="release_qty" type="monotone" stroke="var(--color-release_qty)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Critical stock items</CardTitle>
              <CardDescription>Products below reorder point.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Reorder point</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboard?.inventory.data.lowStock ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell className="text-muted-foreground" colSpan={5}>
                        No critical stock items right now.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (dashboard?.inventory.data.lowStock ?? []).map((row) => (
                      <TableRow key={`${row.product_id}-${row.location_name}`}>
                        <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{formatInteger(row.quantity_available)}</TableCell>
                        <TableCell>{formatInteger(row.reorder_point)}</TableCell>
                        <TableCell>{row.location_name}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ErrorBanner message={dashboard?.products.error ?? null} />

          <Card>
            <CardHeader>
              <CardTitle>Top products by revenue</CardTitle>
              <CardDescription>Revenue ranking by SKU.</CardDescription>
            </CardHeader>
            <CardContent>
              {topRevenueData.length === 0 ? (
                <EmptyChart message="No product revenue data in the selected period." />
              ) : (
                <ChartContainer config={productRevenueChartConfig} className="h-[300px] w-full">
                  <BarChart data={topRevenueData} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                    <YAxis type="category" dataKey="label" width={90} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={6} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product conversion</CardTitle>
              <CardDescription>View-to-cart and cart-to-sale rates.</CardDescription>
            </CardHeader>
            <CardContent>
              {productsConversionData.length === 0 ? (
                <EmptyChart message="No product conversion metrics in the selected period." />
              ) : (
                <ChartContainer config={productConversionChartConfig} className="h-[300px] w-full">
                  <BarChart data={productsConversionData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={20} />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => formatPercent(Number(value))} width={82} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="view_to_cart_rate" fill="var(--color-view_to_cart_rate)" radius={6} />
                    <Bar dataKey="cart_to_sale_rate" fill="var(--color-cart_to_sale_rate)" radius={6} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <ErrorBanner message={dashboard?.operations.error ?? null} />

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending inquiries</CardDescription>
                <CardTitle>{formatInteger(operationsOverview?.pending_inquiries_count ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Resolved inquiries</CardDescription>
                <CardTitle>{formatInteger(operationsOverview?.resolved_inquiries_count ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average rating</CardDescription>
                <CardTitle>{(operationsOverview?.avg_rating ?? 0).toFixed(2)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inquiry distribution</CardTitle>
              <CardDescription>Operational support view.</CardDescription>
            </CardHeader>
            <CardContent>
              {operationsData.length === 0 ? (
                <EmptyChart message="No support data in the selected period." />
              ) : (
                <ChartContainer config={operationsChartConfig} className="h-[260px] w-full">
                  <BarChart data={operationsData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={6} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}

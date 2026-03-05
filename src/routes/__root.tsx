import { HeadContent, Link, Outlet, Scripts, createRootRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

import appCss from '../styles.css?url'
import { AppSidebar } from '@/components/app/app-sidebar'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { getTableConfig } from '@/lib/schema-registry'
import { getSession, signOut } from '@/lib/supabase/auth'
import { getSupabaseClient } from '@/lib/supabase/client'

export const Route = createRootRoute({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Urú',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true
    const supabase = getSupabaseClient()

    const syncSession = async () => {
      try {
        const session = await getSession()
        if (mounted) {
          setIsAuthenticated(Boolean(session))
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false)
        }
      }
    }

    void syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session))
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const isLoginPage = location.pathname === '/login'

  const pageTitle = useMemo(() => {
    if (location.pathname === '/settings') {
      return 'Settings'
    }

    if (location.pathname === '/analytics') {
      return 'Analytics'
    }

    if (location.pathname.startsWith('/tables/')) {
      const tableName = location.pathname.replace('/tables/', '')
      const tableConfig = getTableConfig(tableName)
      if (tableConfig) {
        return `${tableConfig.label} (${tableConfig.table})`
      }

      return 'Table'
    }

    return 'Urú'
  }, [location.pathname])

  if (isLoginPage) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        <div
          data-tauri-drag-region
          className="h-6 w-full shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        />

        <main className="mx-auto w-full max-w-md flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <div
        data-tauri-drag-region
        className="h-6 w-full shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      />

      <SidebarProvider defaultOpen className="flex-1 overflow-hidden">
        <AppSidebar pathname={location.pathname} />

        <SidebarInset>
          <header className="shrink-0 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex w-full items-center justify-between gap-4 px-4 py-2 md:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{pageTitle}</p>
                  <p className="text-muted-foreground hidden text-xs sm:block">Schema-driven data console</p>
                </div>
              </div>

              {isAuthenticated ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await signOut()
                    await navigate({ to: '/login' })
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-7xl p-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <HeadContent />
      </head>
      <body className="h-full">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

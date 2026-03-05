import { HeadContent, Link, Outlet, Scripts, createRootRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import appCss from '../styles.css?url'
import { Button } from '@/components/ui/button'
import { getSession, signOut } from '@/lib/supabase/auth'

export const Route = createRootRoute({
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
    let ignore = false

    getSession()
      .then((session) => {
        if (!ignore) {
          setIsAuthenticated(Boolean(session))
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsAuthenticated(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [location.pathname])

  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <span className="truncate text-2xl font-brand">Urú</span>
          {!isLoginPage && (
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/products" className="text-muted-foreground transition-colors hover:text-foreground">
                Products
              </Link>
              <Link to="/orders" className="text-muted-foreground transition-colors hover:text-foreground">
                Orders
              </Link>
              <Link to="/inventory" className="text-muted-foreground transition-colors hover:text-foreground">
                Inventory
              </Link>
              <Link to="/settings" className="text-muted-foreground transition-colors hover:text-foreground">
                Settings
              </Link>
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
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                >
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

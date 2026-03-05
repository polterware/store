import { HeadContent, Link, Outlet, Scripts, createRootRoute, useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import appCss from '../styles.css?url'
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
        title: 'URU vNext',
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-900/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-sm font-semibold tracking-wide">URU • Dost Manager</div>
          {!isLoginPage && (
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/products" className="text-neutral-300 hover:text-neutral-100">
                Products
              </Link>
              <Link to="/orders" className="text-neutral-300 hover:text-neutral-100">
                Orders
              </Link>
              <Link to="/inventory" className="text-neutral-300 hover:text-neutral-100">
                Inventory
              </Link>
              <Link to="/settings" className="text-neutral-300 hover:text-neutral-100">
                Settings
              </Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  className="rounded bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700"
                  onClick={async () => {
                    await signOut()
                    window.location.href = '/login'
                  }}
                >
                  Sign out
                </button>
              ) : (
                <Link to="/login" className="rounded bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700">
                  Sign in
                </Link>
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
    <html lang="en">
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

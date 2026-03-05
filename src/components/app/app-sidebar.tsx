import { Link } from '@tanstack/react-router'
import { ChevronDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { SchemaTableName } from '@/lib/schema-registry'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import * as schemaTables from '@/lib/schema-tables'

type AppSidebarProps = {
  pathname: string
}

type AppNavItem =
  | {
      label: string
      table: SchemaTableName
    }
  | {
      label: string
      route: '/analytics' | '/settings'
    }

const APP_NAV_ITEMS: Array<AppNavItem> = [
  { label: 'Products', table: 'products' },
  { label: 'Orders', table: 'orders' },
  { label: 'Inventory', table: 'inventory_levels' },
  { label: 'Analytics', route: '/analytics' },
  { label: 'Settings', route: '/settings' },
]

export function AppSidebar({ pathname }: AppSidebarProps) {
  const [query, setQuery] = useState('')

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return schemaTables.SCHEMA_TABLE_GROUPS
    }

    return schemaTables.SCHEMA_TABLE_GROUPS.map((group) => ({
      ...group,
      tables: group.tables.filter((table) => {
        return (
          table.name.toLowerCase().includes(normalized) ||
          table.label.toLowerCase().includes(normalized)
        )
      }),
    })).filter((group) => group.tables.length > 0)
  }, [query])

  return (
    <Sidebar className="pt-4 md:pt-6">
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="font-brand text-xl">Urú</p>
        </div>
        <SidebarInput
          aria-label="Filter tables"
          placeholder="Filter tables..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarSectionDropdown title="Modules">
              <SidebarMenu>
                {APP_NAV_ITEMS.map((item) => {
                  if ('table' in item) {
                    const isActive = pathname === `/tables/${item.table}`

                    return (
                      <SidebarMenuItem key={item.table}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                          <Link to="/tables/$table" params={{ table: item.table }}>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  const isActive = pathname === item.route

                  return (
                    <SidebarMenuItem key={item.route}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link to={item.route}>
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarSectionDropdown>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Tables</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            {filteredGroups.length === 0 ? (
              <p className="text-muted-foreground px-2 text-xs">No tables found for the current filter.</p>
            ) : (
              filteredGroups.map((group) => (
                <SidebarSectionDropdown key={group.key} title={group.label}>
                  <SidebarMenu>
                    {group.tables.map((table) => {
                      const tablePath = `/tables/${table.name}`

                      return (
                        <SidebarMenuItem key={table.name}>
                          <SidebarMenuButton asChild className="h-7" isActive={pathname === tablePath} tooltip={table.label}>
                            <Link to="/tables/$table" params={{ table: table.name }}>
                              <span className="font-mono text-[11px]">{table.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarSectionDropdown>
              ))
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

type SidebarSectionDropdownProps = {
  children: ReactNode
  title: string
}

function SidebarSectionDropdown({ children, title }: SidebarSectionDropdownProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between px-2 text-[11px] font-medium uppercase tracking-wide transition-colors"
        >
          <span>{title}</span>
          <ChevronDownIcon className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

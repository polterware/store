import type { SchemaTableName, TableGroup } from '@/lib/schema-registry'
import { SCHEMA_REGISTRY } from '@/lib/schema-registry'

export type SchemaTable = {
  name: SchemaTableName
  label: string
  description: string
}

export type SchemaTableGroup = {
  key: TableGroup
  label: string
  tables: Array<SchemaTable>
}

const GROUP_LABELS: Record<TableGroup, string> = {
  identity: 'Identity & Access',
  catalog: 'Catalog',
  crm: 'Customers & Relationship',
  inventory: 'Inventory & Logistics',
  commerce: 'Checkout & Orders',
}

export const SCHEMA_TABLE_GROUPS: Array<SchemaTableGroup> = Object.entries(GROUP_LABELS).map(
  ([groupKey, groupLabel]) => ({
    key: groupKey as TableGroup,
    label: groupLabel,
    tables: SCHEMA_REGISTRY.filter((table) => table.group === groupKey)
      .sort((left, right) => left.table.localeCompare(right.table))
      .map((table) => ({
        name: table.table,
        label: table.label,
        description: table.description,
      })),
  }),
)

export const SCHEMA_TABLES = SCHEMA_TABLE_GROUPS.flatMap((group) => group.tables)

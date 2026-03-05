import type { SchemaTableName } from "@/lib/schema-registry";

export const HIDDEN_JOIN_TABLE_REDIRECTS: Partial<
  Record<SchemaTableName, SchemaTableName>
> = {
  user_roles: "profiles",
  customer_group_memberships: "customers",
  order_items: "orders",
  transaction_items: "transactions",
  shipment_items: "shipments",
};

export function resolveHiddenJoinRedirect(
  table: string,
): SchemaTableName | null {
  if (table in HIDDEN_JOIN_TABLE_REDIRECTS) {
    return HIDDEN_JOIN_TABLE_REDIRECTS[table as SchemaTableName] ?? null;
  }

  return null;
}

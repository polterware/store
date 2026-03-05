import type { Database } from "@/types/database";
import type {
  ListOptions,
  TableName,
} from "@/lib/db/repositories/table-crud-repository";
import { TableCrudRepository } from "@/lib/db/repositories/table-crud-repository";
import { getSupabaseClient } from "@/lib/supabase/client";
import { handleSupabaseError } from "@/lib/supabase/errors";

type ReadRpcName =
  | "console_profiles_list"
  | "console_customers_list"
  | "console_orders_list"
  | "console_transactions_list"
  | "console_shipments_list";

const READ_RPC_BY_TABLE: Partial<Record<TableName, ReadRpcName>> = {
  profiles: "console_profiles_list",
  customers: "console_customers_list",
  orders: "console_orders_list",
  transactions: "console_transactions_list",
  shipments: "console_shipments_list",
};

function shouldFallbackToDirectTable(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string };
  const code = candidate.code ?? "";
  const message = candidate.message?.toLowerCase() ?? "";

  return (
    code === "42883" ||
    code === "PGRST202" ||
    message.includes("could not find the function")
  );
}

export const ConsoleReadRepository = {
  async list(
    table: TableName,
    options?: ListOptions,
  ): Promise<Array<Record<string, unknown>>> {
    const rpcName = READ_RPC_BY_TABLE[table];
    if (!rpcName) {
      const data = await TableCrudRepository.list(table, options);
      return data as Array<Record<string, unknown>>;
    }

    const supabase = getSupabaseClient() as any;
    const { data, error } = await supabase.rpc(rpcName, {
      p_include_archived: options?.includeArchived ?? false,
    });

    if (error) {
      if (shouldFallbackToDirectTable(error)) {
        const fallbackData = await TableCrudRepository.list(table, options);
        return fallbackData as Array<Record<string, unknown>>;
      }

      handleSupabaseError(error);
    }

    return (Array.isArray(data) ? data : []) as Array<Record<string, unknown>>;
  },
};

export type ConsoleProfilesListRow =
  Database["public"]["Functions"]["console_profiles_list"]["Returns"][number];
export type ConsoleCustomersListRow =
  Database["public"]["Functions"]["console_customers_list"]["Returns"][number];
export type ConsoleOrdersListRow =
  Database["public"]["Functions"]["console_orders_list"]["Returns"][number];
export type ConsoleTransactionsListRow =
  Database["public"]["Functions"]["console_transactions_list"]["Returns"][number];
export type ConsoleShipmentsListRow =
  Database["public"]["Functions"]["console_shipments_list"]["Returns"][number];

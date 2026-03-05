import { getSupabaseClient } from "@/lib/supabase/client";
import { handleSupabaseError } from "@/lib/supabase/errors";

export type OrderItemDraft = {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
};

export type TransactionItemDraft = {
  id?: string;
  kind: "product" | "shipping" | "discount" | "tax" | "fee";
  reference_id?: string | null;
  amount: number;
};

export type ShipmentItemDraft = {
  id?: string;
  order_item_id: string;
  quantity: number;
};

function normalizeIds(ids: Array<string>): Array<string> {
  return Array.from(
    new Set(ids.map((item) => item.trim()).filter((item) => item.length > 0)),
  );
}

function extractFirstRow<T>(data: unknown): T | null {
  if (Array.isArray(data)) {
    return (data[0] as T | undefined) ?? null;
  }

  if (data && typeof data === "object") {
    return data as T;
  }

  return null;
}

export const ConsoleJoinsRepository = {
  async getProfileRoleIds(userId: string): Promise<Array<string>> {
    const supabase = getSupabaseClient() as any;
    const { data, error } = await supabase.rpc("console_profile_roles_detail", {
      p_user_id: userId,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return ((data ?? []) as Array<{ role_id: string }>).map(
      (row) => row.role_id,
    );
  },

  async syncProfileRoles(
    userId: string,
    roleIds: Array<string>,
  ): Promise<{ target_count: number; active_count: number } | null> {
    const supabase = getSupabaseClient() as any;
    const normalizedRoleIds = normalizeIds(roleIds);

    const { data, error } = await supabase.rpc("console_profile_roles_sync", {
      p_user_id: userId,
      p_role_ids: normalizedRoleIds,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return extractFirstRow<{ target_count: number; active_count: number }>(
      data,
    );
  },

  async getCustomerGroupIds(customerId: string): Promise<Array<string>> {
    const supabase = getSupabaseClient() as any;
    const { data, error } = await supabase.rpc(
      "console_customer_groups_detail",
      {
        p_customer_id: customerId,
      },
    );

    if (error) {
      handleSupabaseError(error);
    }

    return ((data ?? []) as Array<{ group_id: string }>).map(
      (row) => row.group_id,
    );
  },

  async syncCustomerGroups(
    customerId: string,
    groupIds: Array<string>,
  ): Promise<{ target_count: number; active_count: number } | null> {
    const supabase = getSupabaseClient() as any;
    const normalizedGroupIds = normalizeIds(groupIds);

    const { data, error } = await supabase.rpc("console_customer_groups_sync", {
      p_customer_id: customerId,
      p_group_ids: normalizedGroupIds,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return extractFirstRow<{ target_count: number; active_count: number }>(
      data,
    );
  },

  async getProductTagIds(productId: string): Promise<Array<string>> {
    const supabase = getSupabaseClient() as any;
    const { data, error } = await supabase.rpc("console_product_tags_detail", {
      p_product_id: productId,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return ((data ?? []) as Array<{ tag_id: string }>).map((row) => row.tag_id);
  },

  async syncProductTags(
    productId: string,
    tagIds: Array<string>,
  ): Promise<{ tags_count: number } | null> {
    const supabase = getSupabaseClient() as any;
    const normalizedTagIds = normalizeIds(tagIds);

    const { data, error } = await supabase.rpc("console_product_tags_sync", {
      p_product_id: productId,
      p_tag_ids: normalizedTagIds,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return extractFirstRow<{ tags_count: number }>(data);
  },

  async getOrderItems(orderId: string): Promise<Array<OrderItemDraft>> {
    const supabase = getSupabaseClient() as any;
    const { data, error } = await supabase.rpc("console_order_items_detail", {
      p_order_id: orderId,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return ((data ?? []) as Array<OrderItemDraft>).map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    }));
  },

  async syncOrderItems(
    orderId: string,
    items: Array<OrderItemDraft>,
  ): Promise<{
    items_count: number;
    subtotal_amount: number;
    total_amount: number;
  } | null> {
    const supabase = getSupabaseClient() as any;
    const payload = items.map((item) => ({
      id: item.id ?? null,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    }));

    const { data, error } = await supabase.rpc("console_order_items_sync", {
      p_order_id: orderId,
      p_items: payload,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return extractFirstRow<{
      items_count: number;
      subtotal_amount: number;
      total_amount: number;
    }>(data);
  },

  async getTransactionItems(
    transactionId: string,
  ): Promise<Array<TransactionItemDraft>> {
    const supabase = getSupabaseClient() as any;
    const { data, error } = await supabase.rpc(
      "console_transaction_items_detail",
      {
        p_transaction_id: transactionId,
      },
    );

    if (error) {
      handleSupabaseError(error);
    }

    return ((data ?? []) as Array<TransactionItemDraft>).map((item) => ({
      id: item.id,
      kind: item.kind,
      reference_id: item.reference_id ?? null,
      amount: Number(item.amount),
    }));
  },

  async syncTransactionItems(
    transactionId: string,
    items: Array<TransactionItemDraft>,
  ): Promise<{ items_count: number; total_amount: number } | null> {
    const supabase = getSupabaseClient() as any;
    const payload = items.map((item) => ({
      id: item.id ?? null,
      kind: item.kind,
      reference_id: item.reference_id ?? null,
      amount: Number(item.amount),
    }));

    const { data, error } = await supabase.rpc(
      "console_transaction_items_sync",
      {
        p_transaction_id: transactionId,
        p_items: payload,
      },
    );

    if (error) {
      handleSupabaseError(error);
    }

    return extractFirstRow<{ items_count: number; total_amount: number }>(data);
  },

  async getShipmentItems(
    shipmentId: string,
  ): Promise<Array<ShipmentItemDraft>> {
    const supabase = getSupabaseClient() as any;
    const { data, error } = await supabase.rpc(
      "console_shipment_items_detail",
      {
        p_shipment_id: shipmentId,
      },
    );

    if (error) {
      handleSupabaseError(error);
    }

    return ((data ?? []) as Array<ShipmentItemDraft>).map((item) => ({
      id: item.id,
      order_item_id: item.order_item_id,
      quantity: Number(item.quantity),
    }));
  },

  async syncShipmentItems(
    shipmentId: string,
    items: Array<ShipmentItemDraft>,
  ): Promise<{ items_count: number; items_quantity_total: number } | null> {
    const supabase = getSupabaseClient() as any;
    const payload = items.map((item) => ({
      id: item.id ?? null,
      order_item_id: item.order_item_id,
      quantity: Number(item.quantity),
    }));

    const { data, error } = await supabase.rpc("console_shipment_items_sync", {
      p_shipment_id: shipmentId,
      p_items: payload,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return extractFirstRow<{
      items_count: number;
      items_quantity_total: number;
    }>(data);
  },
};

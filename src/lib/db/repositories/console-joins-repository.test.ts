import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConsoleJoinsRepository } from "@/lib/db/repositories/console-joins-repository";
import { getSupabaseClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/errors", () => ({
  handleSupabaseError: vi.fn((error: unknown) => {
    throw error;
  }),
}));

describe("ConsoleJoinsRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("maps detail RPC rows to role ids", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: [{ role_id: "role-1" }, { role_id: "role-2" }],
      error: null,
    });

    vi.mocked(getSupabaseClient).mockReturnValue({ rpc: rpcMock } as never);

    const roleIds = await ConsoleJoinsRepository.getProfileRoleIds("user-1");

    expect(rpcMock).toHaveBeenCalledWith("console_profile_roles_detail", {
      p_user_id: "user-1",
    });
    expect(roleIds).toEqual(["role-1", "role-2"]);
  });

  it("normalizes ids before syncing profile roles", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: [{ target_count: 2, active_count: 2 }],
      error: null,
    });

    vi.mocked(getSupabaseClient).mockReturnValue({ rpc: rpcMock } as never);

    const result = await ConsoleJoinsRepository.syncProfileRoles("user-1", [
      " role-1 ",
      "",
      "role-1",
      "role-2",
    ]);

    expect(rpcMock).toHaveBeenCalledWith("console_profile_roles_sync", {
      p_user_id: "user-1",
      p_role_ids: ["role-1", "role-2"],
    });
    expect(result).toEqual({ target_count: 2, active_count: 2 });
  });

  it("sends normalized payload when syncing order items", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: [{ items_count: 1, subtotal_amount: 10, total_amount: 13 }],
      error: null,
    });

    vi.mocked(getSupabaseClient).mockReturnValue({ rpc: rpcMock } as never);

    const result = await ConsoleJoinsRepository.syncOrderItems("order-1", [
      {
        id: "item-1",
        product_id: "product-1",
        quantity: 2,
        unit_price: 5,
      },
    ]);

    expect(rpcMock).toHaveBeenCalledWith("console_order_items_sync", {
      p_order_id: "order-1",
      p_items: [
        {
          id: "item-1",
          product_id: "product-1",
          quantity: 2,
          unit_price: 5,
        },
      ],
    });
    expect(result).toEqual({
      items_count: 1,
      subtotal_amount: 10,
      total_amount: 13,
    });
  });
});

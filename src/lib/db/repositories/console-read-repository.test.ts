import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConsoleReadRepository } from "@/lib/db/repositories/console-read-repository";
import { TableCrudRepository } from "@/lib/db/repositories/table-crud-repository";
import { getSupabaseClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/errors", () => ({
  handleSupabaseError: vi.fn((error: unknown) => {
    throw error;
  }),
}));

describe("ConsoleReadRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loads profiles through read RPC", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: [{ id: "profile-1", roles_count: 2 }],
      error: null,
    });

    vi.mocked(getSupabaseClient).mockReturnValue({ rpc: rpcMock } as never);

    const rows = await ConsoleReadRepository.list("profiles", {
      includeArchived: true,
    });

    expect(rpcMock).toHaveBeenCalledWith("console_profiles_list", {
      p_include_archived: true,
    });
    expect(rows).toEqual([{ id: "profile-1", roles_count: 2 }]);
  });

  it("falls back to TableCrudRepository when rpc function is unavailable", async () => {
    const rpcMock = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: "PGRST202",
        message: "Could not find the function public.console_profiles_list",
      },
    });

    vi.mocked(getSupabaseClient).mockReturnValue({ rpc: rpcMock } as never);

    const listSpy = vi
      .spyOn(TableCrudRepository, "list")
      .mockResolvedValue([{ id: "profile-fallback" }] as never);

    const rows = await ConsoleReadRepository.list("profiles", {
      includeArchived: false,
    });

    expect(listSpy).toHaveBeenCalledWith("profiles", {
      includeArchived: false,
    });
    expect(rows).toEqual([{ id: "profile-fallback" }]);
  });

  it("uses direct table listing for non-rpc tables", async () => {
    const listSpy = vi
      .spyOn(TableCrudRepository, "list")
      .mockResolvedValue([{ id: "product-1" }] as never);

    const rows = await ConsoleReadRepository.list("products", {
      includeArchived: false,
      orderBy: "updated_at",
      ascending: false,
    });

    expect(listSpy).toHaveBeenCalledWith("products", {
      includeArchived: false,
      orderBy: "updated_at",
      ascending: false,
    });
    expect(rows).toEqual([{ id: "product-1" }]);
  });
});

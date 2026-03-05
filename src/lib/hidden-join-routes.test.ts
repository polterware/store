import { describe, expect, it } from "vitest";

import { resolveHiddenJoinRedirect } from "@/lib/hidden-join-routes";

describe("hidden join redirects", () => {
  it("maps hidden join tables to their parent routes", () => {
    expect(resolveHiddenJoinRedirect("user_roles")).toBe("profiles");
    expect(resolveHiddenJoinRedirect("customer_group_memberships")).toBe(
      "customers",
    );
    expect(resolveHiddenJoinRedirect("order_items")).toBe("orders");
    expect(resolveHiddenJoinRedirect("transaction_items")).toBe("transactions");
    expect(resolveHiddenJoinRedirect("shipment_items")).toBe("shipments");
  });

  it("returns null for regular tables", () => {
    expect(resolveHiddenJoinRedirect("products")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { SCHEMA_TABLES } from "@/lib/schema-tables";

describe("schema tables navigation", () => {
  it("hides join tables from sidebar groups", () => {
    const tableNames = SCHEMA_TABLES.map((table) => table.name);

    expect(tableNames).not.toContain("user_roles");
    expect(tableNames).not.toContain("customer_group_memberships");
    expect(tableNames).not.toContain("order_items");
    expect(tableNames).not.toContain("transaction_items");
    expect(tableNames).not.toContain("shipment_items");
  });
});

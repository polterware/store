import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/lib/supabase/auth";

export const Route = createFileRoute("/products")({
  beforeLoad: async () => {
    const user = await getUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }

    throw redirect({ to: "/tables/$table", params: { table: "products" } });
  },
  component: ProductsRedirectPage,
});

function ProductsRedirectPage() {
  return null;
}

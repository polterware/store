import type { Database, Json } from "@/types/database";

export interface ProductMetadata {
  brand?: string;
  material?: string;
  season?: string;
  gender?: "male" | "female" | "unisex";
  [key: string]: Json | undefined;
}

export interface ShipmentEventPayload {
  location?: string;
  carrier_status?: string;
  notes?: string;
  [key: string]: Json | undefined;
}

export type Product = Omit<Database["public"]["Tables"]["products"]["Row"], "metadata"> & {
  metadata: ProductMetadata;
};
export type ProductInsert = Omit<Database["public"]["Tables"]["products"]["Insert"], "metadata"> & {
  metadata?: ProductMetadata;
};
export type ProductUpdate = Omit<Database["public"]["Tables"]["products"]["Update"], "metadata"> & {
  metadata?: ProductMetadata;
};

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

export type ShipmentEvent = Omit<Database["public"]["Tables"]["shipment_events"]["Row"], "payload"> & {
  payload: ShipmentEventPayload;
};

export type InventoryLevel =
  Database["public"]["Tables"]["inventory_levels"]["Row"];

export type AppRole = Database["public"]["Tables"]["roles"]["Row"]["code"];

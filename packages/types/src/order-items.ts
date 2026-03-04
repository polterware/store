/** All monetary values are in centavos (integer). */
export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  image_url: string | null;
  price: number;
  quantity: number;
  size: string | null;
  sku_snapshot: string | null;
  attributes_snapshot: string | null;
  shipping_snapshot: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateOrderItemDTO = {
  order_id: string;
  product_id?: string;
  name: string;
  image_url?: string;
  price: number;
  quantity: number;
  size?: string;
  sku_snapshot?: string;
  attributes_snapshot?: string;
  shipping_snapshot?: string;
};

export type UpdateOrderItemDTO = {
  id: string;
  product_id?: string;
  name?: string;
  image_url?: string;
  price?: number;
  quantity?: number;
  size?: string;
  sku_snapshot?: string;
  attributes_snapshot?: string;
  shipping_snapshot?: string;
};

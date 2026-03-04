use crate::features::order::models::order_item_model::OrderItem;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderItemDTO {
    pub order_id: String,
    pub product_id: Option<String>,
    pub name: String,
    pub image_url: Option<String>,
    pub price: i64, // centavos
    pub quantity: i32,
    pub size: Option<String>,
    pub sku_snapshot: Option<String>,
    pub attributes_snapshot: Option<String>,
    pub shipping_snapshot: Option<String>,
}

impl CreateOrderItemDTO {
    pub fn into_model(self) -> OrderItem {
        let now = Utc::now();
        OrderItem {
            id: Uuid::new_v4().to_string(),
            order_id: self.order_id,
            product_id: self.product_id,
            name: self.name,
            image_url: self.image_url,
            price: self.price,
            quantity: self.quantity,
            size: self.size,
            sku_snapshot: self.sku_snapshot,
            attributes_snapshot: self.attributes_snapshot,
            shipping_snapshot: self.shipping_snapshot,
            sync_status: Some("created".to_string()),
            created_at: Some(now.to_rfc3339()),
            updated_at: Some(now.to_rfc3339()),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateOrderItemDTO {
    pub id: String,
    pub product_id: Option<String>,
    pub name: Option<String>,
    pub image_url: Option<String>,
    pub price: Option<i64>,
    pub quantity: Option<i32>,
    pub size: Option<String>,
    pub sku_snapshot: Option<String>,
    pub attributes_snapshot: Option<String>,
    pub shipping_snapshot: Option<String>,
}

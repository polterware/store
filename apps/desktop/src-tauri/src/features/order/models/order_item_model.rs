use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct OrderItem {
    pub id: String,
    pub order_id: String,
    pub product_id: Option<String>,
    pub name: String,
    pub image_url: Option<String>,
    pub price: i64, // centavos
    pub quantity: i32,
    pub size: Option<String>,
    pub sku_snapshot: Option<String>,
    pub attributes_snapshot: Option<String>, // JSON
    pub shipping_snapshot: Option<String>,   // JSON
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

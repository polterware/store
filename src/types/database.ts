Initialising login role...
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      checkouts: {
        Row: {
          address_id: string | null
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          email: string | null
          expires_at: string
          id: string
          items: Json
          lifecycle_status: string
          shipping_price: number | null
          shipping_snapshot: Json | null
          status: string
          token: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_id?: string | null
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          items?: Json
          lifecycle_status?: string
          shipping_price?: number | null
          shipping_snapshot?: Json | null
          status?: string
          token?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_id?: string | null
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          items?: Json
          lifecycle_status?: string
          shipping_price?: number | null
          shipping_snapshot?: Json | null
          status?: string
          token?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkouts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          created_by: string
          customer_id: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          line1: string
          line2: string | null
          postal_code: string
          state: string
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          created_by: string
          customer_id: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          line1: string
          line2?: string | null
          postal_code: string
          state: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          created_by?: string
          customer_id?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          line1?: string
          line2?: string | null
          postal_code?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_group_memberships: {
        Row: {
          created_at: string
          created_by: string
          customer_group_id: string
          customer_id: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_group_id: string
          customer_id: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_group_id?: string
          customer_id?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_group_memberships_customer_group_id_fkey"
            columns: ["customer_group_id"]
            isOneToOne: false
            referencedRelation: "customer_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_group_memberships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_groups: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          id: string
          lifecycle_status: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          lifecycle_status?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          lifecycle_status?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          lifecycle_status: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          lifecycle_status?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          lifecycle_status?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          created_by: string
          customer_id: string | null
          deleted_at: string | null
          id: string
          lifecycle_status: string
          product_id: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_id?: string | null
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          product_id?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_id?: string | null
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          product_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_messages: {
        Row: {
          author_id: string
          created_at: string
          deleted_at: string | null
          id: string
          inquiry_id: string
          lifecycle_status: string
          message: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          inquiry_id: string
          lifecycle_status?: string
          message: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          inquiry_id?: string
          lifecycle_status?: string
          message?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_levels: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          location_id: string
          product_id: string
          quantity_available: number
          quantity_on_hand: number
          quantity_reserved: number
          reorder_point: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          location_id: string
          product_id: string
          quantity_available?: number
          quantity_on_hand?: number
          quantity_reserved?: number
          reorder_point?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          location_id?: string
          product_id?: string
          quantity_available?: number
          quantity_on_hand?: number
          quantity_reserved?: number
          reorder_point?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          inventory_level_id: string
          lifecycle_status: string
          movement_type: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          inventory_level_id: string
          lifecycle_status?: string
          movement_type: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          inventory_level_id?: string
          lifecycle_status?: string
          movement_type?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_level_id_fkey"
            columns: ["inventory_level_id"]
            isOneToOne: false
            referencedRelation: "inventory_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      lines: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          image_url: string | null
          lifecycle_status: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          lifecycle_status?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          lifecycle_status?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          code: string
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          image_url: string | null
          lifecycle_status: string
          line_total: number | null
          name: string | null
          order_id: string
          price: number | null
          product_id: string
          quantity: number
          shipping: Json | null
          size: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          lifecycle_status?: string
          line_total?: number | null
          name?: string | null
          order_id: string
          price?: number | null
          product_id: string
          quantity: number
          shipping?: Json | null
          size?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          lifecycle_status?: string
          line_total?: number | null
          name?: string | null
          order_id?: string
          price?: number | null
          product_id?: string
          quantity?: number
          shipping?: Json | null
          size?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          checkout_id: string | null
          contact_email: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          discount_amount: number
          fulfillment_status: string
          id: string
          lifecycle_status: string
          order_number: string | null
          payment_intent_id: string | null
          payment_status: string
          shipment_error: string | null
          shipment_requested_at: string | null
          shipping_address: Json | null
          shipping_amount: number
          shipping_label_url: string | null
          shipping_order_id: string | null
          shipping_provider: string | null
          shipping_tracking_code: string | null
          status: string
          status_timeline: string[]
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          checkout_id?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          discount_amount?: number
          fulfillment_status?: string
          id?: string
          lifecycle_status?: string
          order_number?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          shipment_error?: string | null
          shipment_requested_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number
          shipping_label_url?: string | null
          shipping_order_id?: string | null
          shipping_provider?: string | null
          shipping_tracking_code?: string | null
          status?: string
          status_timeline?: string[]
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          checkout_id?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          discount_amount?: number
          fulfillment_status?: string
          id?: string
          lifecycle_status?: string
          order_number?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          shipment_error?: string | null
          shipment_requested_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number
          shipping_label_url?: string | null
          shipping_order_id?: string | null
          shipping_provider?: string | null
          shipping_tracking_code?: string | null
          status?: string
          status_timeline?: string[]
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          currency: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          method: string
          order_id: string | null
          provider_reference: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          currency?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          method: string
          order_id?: string | null
          provider_reference?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          currency?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          method?: string
          order_id?: string | null
          provider_reference?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_sessions: {
        Row: {
          closed_at: string | null
          closing_amount: number | null
          created_at: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          opened_at: string
          opened_by: string
          opening_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closing_amount?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          opened_at?: string
          opened_by: string
          opening_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closing_amount?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          opened_at?: string
          opened_by?: string
          opening_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_metrics: {
        Row: {
          add_to_cart: number
          created_at: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          metric_date: string
          product_id: string
          revenue_amount: number
          sales_count: number
          updated_at: string
          views: number
        }
        Insert: {
          add_to_cart?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          metric_date: string
          product_id: string
          revenue_amount?: number
          sales_count?: number
          updated_at?: string
          views?: number
        }
        Update: {
          add_to_cart?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          metric_date?: string
          product_id?: string
          revenue_amount?: number
          sales_count?: number
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_metrics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          id: string
          product_id: string
          quantity: number
          size: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number
          size: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          product_id: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          product_id: string
          tag_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          product_id?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category: string | null
          category_id: string | null
          cost: number | null
          created_at: string
          created_by: string
          deleted_at: string | null
          depth: number | null
          description: string | null
          has_size_options: boolean
          height: number | null
          id: string
          images: string[] | null
          is_published: boolean
          lifecycle_status: string
          line_id: string | null
          metadata: Json
          name: string | null
          price: number
          quantity: number | null
          shipping: Json | null
          sku: string
          slug: string
          subcategory: string | null
          title: string
          updated_at: string
          weight: number | null
          width: number | null
        }
        Insert: {
          brand_id?: string | null
          category?: string | null
          category_id?: string | null
          cost?: number | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          depth?: number | null
          description?: string | null
          has_size_options?: boolean
          height?: number | null
          id?: string
          images?: string[] | null
          is_published?: boolean
          lifecycle_status?: string
          line_id?: string | null
          metadata?: Json
          name?: string | null
          price?: number
          quantity?: number | null
          shipping?: Json | null
          sku: string
          slug: string
          subcategory?: string | null
          title: string
          updated_at?: string
          weight?: number | null
          width?: number | null
        }
        Update: {
          brand_id?: string | null
          category?: string | null
          category_id?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          depth?: number | null
          description?: string | null
          has_size_options?: boolean
          height?: number | null
          id?: string
          images?: string[] | null
          is_published?: boolean
          lifecycle_status?: string
          line_id?: string | null
          metadata?: Json
          name?: string | null
          price?: number
          quantity?: number | null
          shipping?: Json | null
          sku?: string
          slug?: string
          subcategory?: string | null
          title?: string
          updated_at?: string
          weight?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "lines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          lifecycle_status: string
          name: string | null
          phone: string | null
          preferences: Json | null
          roles: string[]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          lifecycle_status?: string
          name?: string | null
          phone?: string | null
          preferences?: Json | null
          roles?: string[]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          lifecycle_status?: string
          name?: string | null
          phone?: string | null
          preferences?: Json | null
          roles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          order_id: string
          payment_id: string
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          order_id: string
          payment_id: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          order_id?: string
          payment_id?: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          customer_id: string | null
          deleted_at: string | null
          id: string
          lifecycle_status: string
          product_id: string
          rating: number
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          product_id: string
          rating: number
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipment_events: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          event_type: string
          id: string
          lifecycle_status: string
          occurred_at: string
          payload: Json
          shipment_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          event_type: string
          id?: string
          lifecycle_status?: string
          occurred_at?: string
          payload?: Json
          shipment_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          event_type?: string
          id?: string
          lifecycle_status?: string
          occurred_at?: string
          payload?: Json
          shipment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_items: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          order_item_id: string
          quantity: number
          shipment_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          order_item_id: string
          quantity: number
          shipment_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          order_item_id?: string
          quantity?: number
          shipment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          delivered_at: string | null
          id: string
          lifecycle_status: string
          order_id: string
          shipped_at: string | null
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          lifecycle_status?: string
          order_id: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          delivered_at?: string | null
          id?: string
          lifecycle_status?: string
          order_id?: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      transaction_items: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          kind: string
          lifecycle_status: string
          reference_id: string | null
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          kind: string
          lifecycle_status?: string
          reference_id?: string | null
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          kind?: string
          lifecycle_status?: string
          reference_id?: string | null
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          checkout_id: string | null
          created_at: string
          created_by: string
          currency: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          order_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          checkout_id?: string | null
          created_at?: string
          created_by: string
          currency?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          order_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          checkout_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          order_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          lifecycle_status: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          lifecycle_status?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analytics_checkout_funnel: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          conversion_rate: number
          sessions_count: number
          stage: string
          stage_order: number
        }[]
      }
      analytics_checkout_timeseries: {
        Args: {
          p_bucket?: string
          p_end_date?: string
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          bucket_date: string
          completed_amount: number
          completed_count: number
          completion_rate: number
          opened_count: number
        }[]
      }
      analytics_inventory_low_stock: {
        Args: { p_limit?: number }
        Returns: {
          location_name: string
          product_id: string
          quantity_available: number
          reorder_point: number
          sku: string
          title: string
        }[]
      }
      analytics_inventory_movements_timeseries: {
        Args: {
          p_bucket?: string
          p_end_date?: string
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          adjustment_qty: number
          bucket_date: string
          inbound_qty: number
          outbound_qty: number
          release_qty: number
          reservation_qty: number
        }[]
      }
      analytics_inventory_overview: {
        Args: never
        Returns: {
          healthy_skus: number
          low_stock_skus: number
          out_of_stock_skus: number
          total_available_units: number
          total_reserved_units: number
          total_skus: number
        }[]
      }
      analytics_operations_overview: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          approved_reviews_count: number
          avg_rating: number
          open_inquiries_count: number
          pending_inquiries_count: number
          pending_reviews_count: number
          resolved_inquiries_count: number
        }[]
      }
      analytics_orders_status_breakdown: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          orders_count: number
          status: string
          total_amount: number
        }[]
      }
      analytics_payments_overview: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          captured_amount: number
          captured_payments_count: number
          failed_amount: number
          failed_payments_count: number
          net_collected_amount: number
          payment_success_rate: number
          payments_count: number
          pending_amount: number
          refunded_amount: number
        }[]
      }
      analytics_payments_status_breakdown: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          payments_count: number
          status: string
          total_amount: number
        }[]
      }
      analytics_products_conversion: {
        Args: { p_end_date?: string; p_limit?: number; p_start_date?: string }
        Returns: {
          add_to_cart: number
          cart_to_sale_rate: number
          product_id: string
          sales_count: number
          sku: string
          title: string
          view_to_cart_rate: number
          views: number
        }[]
      }
      analytics_products_top_revenue: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          avg_unit_price: number
          orders_count: number
          product_id: string
          revenue: number
          sku: string
          title: string
          units_sold: number
        }[]
      }
      analytics_sales_overview: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          avg_ticket: number
          cancellation_rate: number
          cancelled_orders_count: number
          gross_sales: number
          net_sales: number
          orders_count: number
          paid_orders_count: number
          paid_sales: number
          refunded_amount: number
        }[]
      }
      analytics_sales_timeseries: {
        Args: {
          p_bucket?: string
          p_end_date?: string
          p_start_date?: string
          p_timezone?: string
        }
        Returns: {
          bucket_date: string
          gross_sales: number
          net_sales: number
          orders_count: number
          paid_sales: number
          refunded_amount: number
        }[]
      }
      bootstrap_first_admin: {
        Args: { p_user_email: string }
        Returns: boolean
      }
      cancel_order_with_restock: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: {
          order_id: string
          status: string
        }[]
      }
      cleanup_expired_checkouts: { Args: never; Returns: number }
      console_customer_groups_detail: {
        Args: { p_customer_id: string }
        Returns: {
          group_id: string
        }[]
      }
      console_customer_groups_sync: {
        Args: { p_customer_id: string; p_group_ids: string[] }
        Returns: {
          active_count: number
          target_count: number
        }[]
      }
      console_customers_list: {
        Args: { p_include_archived?: boolean }
        Returns: {
          created_at: string
          created_by: string
          deleted_at: string
          email: string
          full_name: string
          group_names_csv: string
          groups_count: number
          id: string
          lifecycle_status: string
          notes: string
          phone: string
          updated_at: string
        }[]
      }
      console_order_items_detail: {
        Args: { p_order_id: string }
        Returns: {
          id: string
          line_total: number
          product_id: string
          quantity: number
          unit_price: number
        }[]
      }
      console_order_items_sync: {
        Args: { p_items: Json; p_order_id: string }
        Returns: {
          items_count: number
          subtotal_amount: number
          total_amount: number
        }[]
      }
      console_orders_list: {
        Args: { p_include_archived?: boolean }
        Returns: {
          checkout_id: string
          created_at: string
          created_by: string
          customer_id: string
          deleted_at: string
          discount_amount: number
          fulfillment_status: string
          id: string
          items_count: number
          items_quantity_total: number
          items_total_amount: number
          lifecycle_status: string
          order_number: string
          payment_status: string
          shipping_amount: number
          status: string
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }[]
      }
      console_product_tags_detail: {
        Args: { p_product_id: string }
        Returns: {
          tag_id: string
        }[]
      }
      console_product_tags_sync: {
        Args: { p_product_id: string; p_tag_ids: string[] }
        Returns: {
          tags_count: number
        }[]
      }
      console_profile_roles_detail: {
        Args: { p_user_id: string }
        Returns: {
          role_id: string
        }[]
      }
      console_profile_roles_sync: {
        Args: { p_role_ids: string[]; p_user_id: string }
        Returns: {
          active_count: number
          target_count: number
        }[]
      }
      console_profiles_list: {
        Args: { p_include_archived?: boolean }
        Returns: {
          avatar_url: string
          created_at: string
          deleted_at: string
          email: string
          full_name: string
          id: string
          lifecycle_status: string
          role_names_csv: string
          roles_count: number
          updated_at: string
        }[]
      }
      console_shipment_items_detail: {
        Args: { p_shipment_id: string }
        Returns: {
          id: string
          order_item_id: string
          quantity: number
        }[]
      }
      console_shipment_items_sync: {
        Args: { p_items: Json; p_shipment_id: string }
        Returns: {
          items_count: number
          items_quantity_total: number
        }[]
      }
      console_shipments_list: {
        Args: { p_include_archived?: boolean }
        Returns: {
          carrier: string
          created_at: string
          created_by: string
          deleted_at: string
          delivered_at: string
          id: string
          items_count: number
          items_quantity_total: number
          lifecycle_status: string
          order_id: string
          shipped_at: string
          status: string
          tracking_number: string
          updated_at: string
        }[]
      }
      console_transaction_items_detail: {
        Args: { p_transaction_id: string }
        Returns: {
          amount: number
          id: string
          kind: string
          reference_id: string
        }[]
      }
      console_transaction_items_sync: {
        Args: { p_items: Json; p_transaction_id: string }
        Returns: {
          items_count: number
          total_amount: number
        }[]
      }
      console_transactions_list: {
        Args: { p_include_archived?: boolean }
        Returns: {
          checkout_id: string
          created_at: string
          created_by: string
          currency: string
          deleted_at: string
          id: string
          item_kinds_csv: string
          items_count: number
          items_total_amount: number
          lifecycle_status: string
          order_id: string
          status: string
          total_amount: number
          updated_at: string
        }[]
      }
      create_order_from_checkout: {
        Args: {
          p_checkout_id: string
          p_contact_email: string
          p_items: Json
          p_payment_intent_id: string
          p_shipping_address: Json
          p_status_timeline: string[]
          p_total_amount: number
          p_user_id: string
        }
        Returns: string
      }
      create_order_with_items: {
        Args: { p_customer_id?: string; p_items?: Json }
        Returns: {
          order_id: string
          order_number: string
        }[]
      }
      fetch_dost_orders: { Args: never; Returns: Json }
      fetch_dost_products: { Args: never; Returns: Json }
      fetch_dost_profile: { Args: never; Returns: Json }
      finalize_sale: {
        Args: { p_checkout_id: string }
        Returns: {
          order_id: string
          payment_id: string
          transaction_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      release_inventory_stock: {
        Args: {
          p_location_id: string
          p_product_id: string
          p_quantity: number
          p_reason?: string
        }
        Returns: {
          inventory_level_id: string
          quantity_available: number
        }[]
      }
      request_refund: {
        Args: { p_amount: number; p_payment_id: string; p_reason?: string }
        Returns: {
          refund_id: string
          status: string
        }[]
      }
      reserve_cart_stock: { Args: { p_items: Json }; Returns: Json }
      reserve_inventory_stock: {
        Args: {
          p_location_id: string
          p_product_id: string
          p_quantity: number
          p_reason?: string
        }
        Returns: {
          inventory_level_id: string
          quantity_reserved: number
        }[]
      }
      save_dost_order: {
        Args: {
          p_checkout_id: string
          p_customer_name: string
          p_email: string
          p_items: Json
          p_payment_intent_id: string
          p_shipping_cents: number
          p_tax_cents: number
          p_total_cents: number
          p_user_id: string
        }
        Returns: string
      }
      update_dost_profile: {
        Args: { p_name: string; p_phone?: string; p_preferences?: Json }
        Returns: undefined
      }
      update_order_status: {
        Args: {
          p_fulfillment_status?: string
          p_order_id: string
          p_payment_status?: string
          p_status: string
        }
        Returns: {
          order_id: string
          status: string
        }[]
      }
      validate_cart_stock: { Args: { p_items: Json }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
A new version of Supabase CLI is available: v2.78.1 (currently installed v2.75.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli

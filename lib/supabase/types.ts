export type FabricType = "cotton" | "linen" | "polyester"
export type FabricInputMode = "swatch" | "hex" | "upload"
export type GarmentType = "shirt" | "jacket" | "pants"

export type OrderOrigin = "kickstarter" | "shopify" | "manual"
export type OrderStatus =
  | "pledge_received" | "configuring" | "confirmed"
  | "in_production" | "shipped" | "cancelled"
export type SubOrderStatus =
  | "pending" | "configuring" | "confirmed"
  | "in_production" | "completed" | "cancelled"

interface ShippingAddress {
  line1?: string; line2?: string; city?: string
  state?: string; postalCode?: string; country?: string
}

export interface Database {
  public: {
    Tables: {
      fabrics: {
        Row: {
          id: string
          product_id: string
          name: string
          fabric_type: FabricType
          input_mode: FabricInputMode
          color_hex: string | null
          image_url: string | null
          thumbnail_url: string | null
          price: number
          is_printed: boolean
          pbr_settings: {
            normal_scale: number
            roughness: number
            bump_scale: number
            sheen: number
            repeat_x: number
            repeat_y: number
            darkness: number
          }
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["fabrics"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string }
        Update: Partial<Database["public"]["Tables"]["fabrics"]["Insert"]>
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          auth_user_id: string | null
          email: string
          name: string
          role: string
          created_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["admin_users"]["Row"]> & { email: string }
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          shipping_address: ShippingAddress | null
          source: OrderOrigin
          kickstarter_backer_uid: string | null
          shopify_customer_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["customers"]["Row"]> & { email: string }
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>
        Relationships: []
      }
      packages: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          garment_count: number
          allowed_garment_types: string[]
          item_rules: Record<string, unknown>
          base_value: number
          currency: string
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["packages"]["Row"]> & { code: string; name: string }
        Update: Partial<Database["public"]["Tables"]["packages"]["Insert"]>
        Relationships: []
      }
      kickstarter_imports: {
        Row: {
          id: string
          source: "kickstarter_csv" | "backerkit" | "crowdox" | "manual"
          filename: string | null
          file_hash: string | null
          raw_row_count: number
          imported_count: number
          updated_count: number
          skipped_count: number
          column_mapping: Record<string, unknown> | null
          status: "pending" | "completed" | "failed"
          error_message: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["kickstarter_imports"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["kickstarter_imports"]["Insert"]>
        Relationships: []
      }
      kickstarter_backers: {
        Row: {
          id: string
          import_id: string
          backer_uid: string | null
          email: string | null
          name: string | null
          pledge_tier_label: string | null
          quantity: number
          pledge_amount: number | null
          currency: string | null
          reward_title: string | null
          addons_raw: string | null
          raw_json: Record<string, unknown>
          matched_customer_id: string | null
          matched_order_id: string | null
          created_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["kickstarter_backers"]["Row"]> & { import_id: string; raw_json: Record<string, unknown> }
        Update: Partial<Database["public"]["Tables"]["kickstarter_backers"]["Insert"]>
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          package_id: string | null
          origin: OrderOrigin
          kickstarter_backer_id: string | null
          shopify_draft_order_id: string | null
          status: OrderStatus
          total_value: number
          currency: string
          notes: string | null
          kickstarter_ref: string | null
          packing_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & { order_number: string; customer_id: string }
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>
        Relationships: []
      }
      sub_orders: {
        Row: {
          id: string
          order_id: string
          package_slot_index: number
          garment_type: string
          product_id: string | null
          configurator_selections: Record<string, unknown>
          measurement_id: string | null
          article_code_human: string | null
          article_code_barcode: string | null
          item_type: string | null
          color: string | null
          sub_order_ref: string | null
          package_item_id: string | null
          status: SubOrderStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["sub_orders"]["Row"]> & { order_id: string; garment_type: string }
        Update: Partial<Database["public"]["Tables"]["sub_orders"]["Insert"]>
        Relationships: []
      }
      measurements: {
        Row: {
          id: string
          customer_id: string
          sub_order_id: string | null
          garment_type: string
          raw_values: Record<string, number>
          allowances: Record<string, number>
          production_values: Record<string, number>
          unit: "cm" | "in"
          version: number
          locked: boolean
          locked_at: string | null
          locked_by: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["measurements"]["Row"]> & { customer_id: string; garment_type: string }
        Update: Partial<Database["public"]["Tables"]["measurements"]["Insert"]>
        Relationships: []
      }
      article_segment_values: {
        Row: {
          id: string
          segment_no: number
          code: string
          label: string
          supplier_code: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["article_segment_values"]["Row"]> & { segment_no: number; code: string; label: string }
        Update: Partial<Database["public"]["Tables"]["article_segment_values"]["Insert"]>
        Relationships: []
      }
      product_skus: {
        Row: {
          id: string
          sku_key: string
          product_category: string
          color: string | null
          label: string | null
          fabric_composition: string | null
          target_group_code: string
          product_category_code: string
          fabric_family_code: string
          fabric_type_code: string
          supplier_code: string
          supplier_article_code: string
          specs_code: string
          reserved_code: string | null
          article_human: string
          article_machine: string
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["product_skus"]["Row"]> & { sku_key: string; product_category: string }
        Update: Partial<Database["public"]["Tables"]["product_skus"]["Insert"]>
        Relationships: []
      }
      package_items: {
        Row: {
          id: string
          package_id: string
          item_type: string
          quantity: number
          allowed_colors: string[]
          constraints: Record<string, unknown>
          sort_order: number
          created_at: string
        }
        Insert: Partial<Database["public"]["Tables"]["package_items"]["Row"]> & { package_id: string; item_type: string }
        Update: Partial<Database["public"]["Tables"]["package_items"]["Insert"]>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

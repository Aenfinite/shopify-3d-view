export type FabricType = "cotton" | "linen" | "polyester"
export type FabricInputMode = "swatch" | "hex" | "upload"
export type GarmentType = "shirt" | "jacket" | "pants"

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
        Insert: Omit<Database["public"]["Tables"]["fabrics"]["Row"], "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["fabrics"]["Insert"]>
      }
      admin_users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["admin_users"]["Row"], "created_at">
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>
      }
    }
  }
}

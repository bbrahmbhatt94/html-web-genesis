export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          last_accessed: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          last_accessed?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_accessed?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          password_hash: string
          role: Database["public"]["Enums"]["admin_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          password_hash: string
          role?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          password_hash?: string
          role?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id: string
          ip_address: unknown | null
          page_url: string
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id?: string
          ip_address?: unknown | null
          page_url: string
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: Database["public"]["Enums"]["analytics_event_type"]
          id?: string
          ip_address?: unknown | null
          page_url?: string
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      analytics_performance: {
        Row: {
          created_at: string
          cumulative_layout_shift: number | null
          first_contentful_paint: number | null
          first_input_delay: number | null
          id: string
          largest_contentful_paint: number | null
          load_time: number
          page_url: string
          session_id: string
        }
        Insert: {
          created_at?: string
          cumulative_layout_shift?: number | null
          first_contentful_paint?: number | null
          first_input_delay?: number | null
          id?: string
          largest_contentful_paint?: number | null
          load_time: number
          page_url: string
          session_id: string
        }
        Update: {
          created_at?: string
          cumulative_layout_shift?: number | null
          first_contentful_paint?: number | null
          first_input_delay?: number | null
          id?: string
          largest_contentful_paint?: number | null
          load_time?: number
          page_url?: string
          session_id?: string
        }
        Relationships: []
      }
      analytics_sessions: {
        Row: {
          browser: string | null
          conversion_value: number | null
          converted: boolean | null
          country: string | null
          device_type: string | null
          end_time: string | null
          id: string
          page_views: number | null
          referrer: string | null
          session_id: string
          start_time: string
          total_time_spent: number | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          country?: string | null
          device_type?: string | null
          end_time?: string | null
          id?: string
          page_views?: number | null
          referrer?: string | null
          session_id: string
          start_time?: string
          total_time_spent?: number | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          country?: string | null
          device_type?: string | null
          end_time?: string | null
          id?: string
          page_views?: number | null
          referrer?: string | null
          session_id?: string
          start_time?: string
          total_time_spent?: number | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      download_links: {
        Row: {
          created_at: string
          download_count: number | null
          download_token: string
          expires_at: string
          id: string
          is_active: boolean | null
          last_accessed: string | null
          max_downloads: number | null
          order_id: string | null
        }
        Insert: {
          created_at?: string
          download_count?: number | null
          download_token: string
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_accessed?: string | null
          max_downloads?: number | null
          order_id?: string | null
        }
        Update: {
          created_at?: string
          download_count?: number | null
          download_token?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_accessed?: string | null
          max_downloads?: number | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "download_links_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          delivered_at: string | null
          id: string
          product_name: string
          status: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_email: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          id?: string
          product_name: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_email: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          id?: string
          product_name?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved_at: string | null
          approved_by_admin_id: string | null
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          rating: number
          review_text: string
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by_admin_id?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          rating: number
          review_text: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by_admin_id?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          rating?: number
          review_text?: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_approved_by_admin_id_fkey"
            columns: ["approved_by_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_admin_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_downloads: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_review_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_reviews: number
          average_rating: number
          rating_breakdown: Json
        }[]
      }
      is_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      is_authenticated_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "viewer"
      analytics_event_type:
        | "page_view"
        | "video_play"
        | "video_pause"
        | "video_complete"
        | "scroll_depth"
        | "button_click"
        | "section_view"
        | "timer_interaction"
        | "menu_toggle"
        | "conversion"
        | "checkout_start"
        | "payment_complete"
      review_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "admin", "viewer"],
      analytics_event_type: [
        "page_view",
        "video_play",
        "video_pause",
        "video_complete",
        "scroll_depth",
        "button_click",
        "section_view",
        "timer_interaction",
        "menu_toggle",
        "conversion",
        "checkout_start",
        "payment_complete",
      ],
      review_status: ["pending", "approved", "rejected"],
    },
  },
} as const

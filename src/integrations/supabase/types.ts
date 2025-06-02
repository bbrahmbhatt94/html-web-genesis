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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_email: string }
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
    },
  },
} as const

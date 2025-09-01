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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      destinations: {
        Row: {
          best_time: string | null
          category: string
          coordinates: unknown | null
          created_at: string
          description: string | null
          duration: string | null
          entry_fee: string | null
          highlights: string[] | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          location: string
          name: string
          rating: number | null
          review_count: number | null
          state: string | null
          updated_at: string
        }
        Insert: {
          best_time?: string | null
          category: string
          coordinates?: unknown | null
          created_at?: string
          description?: string | null
          duration?: string | null
          entry_fee?: string | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location: string
          name: string
          rating?: number | null
          review_count?: number | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          best_time?: string | null
          category?: string
          coordinates?: unknown | null
          created_at?: string
          description?: string | null
          duration?: string | null
          entry_fee?: string | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location?: string
          name?: string
          rating?: number | null
          review_count?: number | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_reviews: {
        Row: {
          created_at: string
          id: string
          images: string[] | null
          rating: number
          review_text: string | null
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          images?: string[] | null
          rating: number
          review_text?: string | null
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          images?: string[] | null
          rating?: number
          review_text?: string | null
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          end_date: string | null
          end_location: string
          estimated_fuel_cost: number | null
          fuel_price: number | null
          fuel_type: string | null
          id: string
          is_public: boolean | null
          mileage: number | null
          start_date: string | null
          start_location: string
          status: string | null
          title: string
          total_distance: number | null
          travelers: number | null
          trip_data: Json | null
          updated_at: string
          user_id: string
          vehicle_type: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          end_location: string
          estimated_fuel_cost?: number | null
          fuel_price?: number | null
          fuel_type?: string | null
          id?: string
          is_public?: boolean | null
          mileage?: number | null
          start_date?: string | null
          start_location: string
          status?: string | null
          title: string
          total_distance?: number | null
          travelers?: number | null
          trip_data?: Json | null
          updated_at?: string
          user_id: string
          vehicle_type?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          end_location?: string
          estimated_fuel_cost?: number | null
          fuel_price?: number | null
          fuel_type?: string | null
          id?: string
          is_public?: boolean | null
          mileage?: number | null
          start_date?: string | null
          start_location?: string
          status?: string | null
          title?: string
          total_distance?: number | null
          travelers?: number | null
          trip_data?: Json | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      waypoints: {
        Row: {
          address: string | null
          coordinates: unknown | null
          created_at: string
          description: string | null
          estimated_cost: string | null
          estimated_time: string | null
          id: string
          name: string
          stop_order: number
          trip_id: string
          waypoint_type: string | null
        }
        Insert: {
          address?: string | null
          coordinates?: unknown | null
          created_at?: string
          description?: string | null
          estimated_cost?: string | null
          estimated_time?: string | null
          id?: string
          name: string
          stop_order: number
          trip_id: string
          waypoint_type?: string | null
        }
        Update: {
          address?: string | null
          coordinates?: unknown | null
          created_at?: string
          description?: string | null
          estimated_cost?: string | null
          estimated_time?: string | null
          id?: string
          name?: string
          stop_order?: number
          trip_id?: string
          waypoint_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waypoints_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      episodes: {
        Row: {
          created_at: string
          dailymotion_video_id: string
          description: string | null
          episode_number: number | null
          id: string
          published_at: string | null
          season_number: number | null
          series_id: string
          title: string
          updated_at: string
          youtube_video_id: string | null
        }
        Insert: {
          created_at?: string
          dailymotion_video_id: string
          description?: string | null
          episode_number?: number | null
          id?: string
          published_at?: string | null
          season_number?: number | null
          series_id: string
          title: string
          updated_at?: string
          youtube_video_id?: string | null
        }
        Update: {
          created_at?: string
          dailymotion_video_id?: string
          description?: string | null
          episode_number?: number | null
          id?: string
          published_at?: string | null
          season_number?: number | null
          series_id?: string
          title?: string
          updated_at?: string
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          category: Database["public"]["Enums"]["series_category"] | null
          cover_image_url: string | null
          created_at: string
          dailymotion_playlist_id: string | null
          description: string | null
          fts: unknown | null
          id: string
          is_published: boolean
          rating_count: number
          rating_sum: number
          slug: string | null
          title: string
          updated_at: string
          views_count: number
          youtube_playlist_id: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["series_category"] | null
          cover_image_url?: string | null
          created_at?: string
          dailymotion_playlist_id?: string | null
          description?: string | null
          fts?: unknown | null
          id?: string
          is_published?: boolean
          rating_count?: number
          rating_sum?: number
          slug?: string | null
          title: string
          updated_at?: string
          views_count?: number
          youtube_playlist_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["series_category"] | null
          cover_image_url?: string | null
          created_at?: string
          dailymotion_playlist_id?: string | null
          description?: string | null
          fts?: unknown | null
          id?: string
          is_published?: boolean
          rating_count?: number
          rating_sum?: number
          slug?: string | null
          title?: string
          updated_at?: string
          views_count?: number
          youtube_playlist_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_episode: {
        Args:
          | {
              admin_code: string
              series_id: string
              title: string
              dailymotion_video_id: string
              description?: string
              season_number?: number
              episode_number?: number
              published_at?: string
            }
          | {
              admin_code: string
              series_id: string
              title: string
              dailymotion_video_id: string
              description?: string
              season_number?: number
              episode_number?: number
              published_at?: string
              youtube_video_id?: string
            }
        Returns: {
          created_at: string
          dailymotion_video_id: string
          description: string | null
          episode_number: number | null
          id: string
          published_at: string | null
          season_number: number | null
          series_id: string
          title: string
          updated_at: string
          youtube_video_id: string | null
        }
      }
      admin_create_series: {
        Args:
          | {
              admin_code: string
              title: string
              description?: string
              cover_image_url?: string
              dailymotion_playlist_id?: string
              slug?: string
              is_published?: boolean
            }
          | {
              admin_code: string
              title: string
              description?: string
              cover_image_url?: string
              dailymotion_playlist_id?: string
              slug?: string
              is_published?: boolean
              category?: Database["public"]["Enums"]["series_category"]
            }
          | {
              admin_code: string
              title: string
              description?: string
              cover_image_url?: string
              dailymotion_playlist_id?: string
              slug?: string
              is_published?: boolean
              category?: Database["public"]["Enums"]["series_category"]
              youtube_playlist_id?: string
            }
          | {
              admin_code: string
              title: string
              description?: string
              cover_image_url?: string
              dailymotion_playlist_id?: string
              slug?: string
              is_published?: boolean
              youtube_playlist_id?: string
            }
        Returns: {
          category: Database["public"]["Enums"]["series_category"] | null
          cover_image_url: string | null
          created_at: string
          dailymotion_playlist_id: string | null
          description: string | null
          fts: unknown | null
          id: string
          is_published: boolean
          rating_count: number
          rating_sum: number
          slug: string | null
          title: string
          updated_at: string
          views_count: number
          youtube_playlist_id: string | null
        }
      }
      admin_delete_episode: {
        Args: { admin_code: string; p_episode_id: string }
        Returns: undefined
      }
      admin_delete_series: {
        Args: { admin_code: string; p_series_id: string }
        Returns: undefined
      }
      increment_series_view: {
        Args: { p_series_id: string }
        Returns: number
      }
      rate_series: {
        Args: { p_series_id: string; p_rating: number }
        Returns: number
      }
    }
    Enums: {
      series_category: "donghua" | "anime" | "movie" | "cartoon"
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
    Enums: {
      series_category: ["donghua", "anime", "movie", "cartoon"],
    },
  },
} as const

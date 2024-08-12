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
      departments: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      factories: {
        Row: {
          abbreviation: string
          id: number
          name: string
        }
        Insert: {
          abbreviation: string
          id?: number
          name: string
        }
        Update: {
          abbreviation?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      factory_sections: {
        Row: {
          factory_id: number
          id: number
          name: string
        }
        Insert: {
          factory_id: number
          id?: number
          name: string
        }
        Update: {
          factory_id?: number
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "factory_sections_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_parts: {
        Row: {
          id: number
          machine_id: number
          part_id: number
          qty: number
          unit: string
        }
        Insert: {
          id?: number
          machine_id: number
          part_id: number
          qty: number
          unit: string
        }
        Update: {
          id?: number
          machine_id?: number
          part_id?: number
          qty?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "machine_parts_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_parts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      machines: {
        Row: {
          factory_section_id: number
          id: number
          is_running: boolean
          number: number
          type: string
        }
        Insert: {
          factory_section_id: number
          id?: number
          is_running: boolean
          number: number
          type: string
        }
        Update: {
          factory_section_id?: number
          id?: number
          is_running?: boolean
          number?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "machines_factory_section_id_fkey"
            columns: ["factory_section_id"]
            isOneToOne: false
            referencedRelation: "factory_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          "cost/unit": string | null
          factory_id: number
          factory_section_id: number
          goods_sent_date: string | null
          id: number
          is_part_recieved: boolean
          machine_id: number
          note: string | null
          order_id: number
          part_id: number
          qty: number
          sample_received: number | null
          sample_unit: string | null
          vendor: string | null
        }
        Insert: {
          "cost/unit"?: string | null
          factory_id: number
          factory_section_id: number
          goods_sent_date?: string | null
          id?: number
          is_part_recieved?: boolean
          machine_id: number
          note?: string | null
          order_id: number
          part_id: number
          qty: number
          sample_received?: number | null
          sample_unit?: string | null
          vendor?: string | null
        }
        Update: {
          "cost/unit"?: string | null
          factory_id?: number
          factory_section_id?: number
          goods_sent_date?: string | null
          id?: number
          is_part_recieved?: boolean
          machine_id?: number
          note?: string | null
          order_id?: number
          part_id?: number
          qty?: number
          sample_received?: number | null
          sample_unit?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_factory_section_id_fkey"
            columns: ["factory_section_id"]
            isOneToOne: false
            referencedRelation: "factory_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by_user_id: number
          current_status_id: number
          department_id: number
          id: number
          order_note: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id: number
          current_status_id: number
          department_id: number
          id?: number
          order_note?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: number
          current_status_id?: number
          department_id?: number
          id?: number
          order_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_current_status_id_fkey"
            columns: ["current_status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          created_at: string
          description: string
          id: number
          name: string
          unit: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          name: string
          unit: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          name?: string
          unit?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string
          id: number
          name: string
          password: string
          permission: string
          position: string
          user_id: string
        }
        Insert: {
          email: string
          id?: number
          name: string
          password: string
          permission: string
          position: string
          user_id?: string
        }
        Update: {
          email?: string
          id?: number
          name?: string
          password?: string
          permission?: string
          position?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      status_tracker: {
        Row: {
          action_at: string
          action_by_user_id: number
          id: number
          order_id: number
          status_id: number
        }
        Insert: {
          action_at?: string
          action_by_user_id: number
          id?: number
          order_id: number
          status_id: number
        }
        Update: {
          action_at?: string
          action_by_user_id?: number
          id?: number
          order_id?: number
          status_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "status_tracker_action_by_user_id_fkey"
            columns: ["action_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_tracker_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_tracker_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      statuses: {
        Row: {
          comment: string
          id: number
          name: string
        }
        Insert: {
          comment: string
          id?: number
          name: string
        }
        Update: {
          comment?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      storage: {
        Row: {
          factory_id: number
          id: number
        }
        Insert: {
          factory_id: number
          id?: number
        }
        Update: {
          factory_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "storage_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_parts: {
        Row: {
          id: number
          part_id: number
          qty: number
          storage_id: number
          unit: string
        }
        Insert: {
          id?: number
          part_id: number
          qty: number
          storage_id: number
          unit: string
        }
        Update: {
          id?: number
          part_id?: number
          qty?: number
          storage_id?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_parts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_parts_storage_id_fkey"
            columns: ["storage_id"]
            isOneToOne: false
            referencedRelation: "storage"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: "admin" | "agent";
          organization_id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role: "admin" | "agent";
          organization_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: "admin" | "agent";
          organization_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      shipments: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          total_weight: number | null;
          total_cost: number | null;
          status: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          total_weight?: number | null;
          total_cost?: number | null;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          total_weight?: number | null;
          total_cost?: number | null;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipments_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tracking_items: {
        Row: {
          id: string;
          shipment_id: string;
          organization_id: string;
          tracking_id: string;
          product_name: string | null;
          courier: string;
          weight: number | null;
          cost: number | null;
          status: string;
          comment: string | null;
          is_confirmed_by_agent: boolean;
          confirmed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          organization_id: string;
          tracking_id: string;
          product_name?: string | null;
          courier: string;
          weight?: number | null;
          cost?: number | null;
          status?: string;
          comment?: string | null;
          is_confirmed_by_agent?: boolean;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          organization_id?: string;
          tracking_id?: string;
          product_name?: string | null;
          courier?: string;
          weight?: number | null;
          cost?: number | null;
          status?: string;
          comment?: string | null;
          is_confirmed_by_agent?: boolean;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tracking_items_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: false;
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracking_items_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "admin" | "agent";
    };
    CompositeTypes: Record<string, never>;
  };
};

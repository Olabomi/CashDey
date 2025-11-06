export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          preferred_name: string;
          communication_style: "formal" | "pidgin" | "auto";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          preferred_name: string;
          communication_style?: "formal" | "pidgin" | "auto";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          preferred_name?: string;
          communication_style?: "formal" | "pidgin" | "auto";
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          description: string | null;
          date: string;
          type: "expense" | "income";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category: string;
          description?: string | null;
          date: string;
          type?: "expense" | "income";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          category?: string;
          description?: string | null;
          date?: string;
          type?: "expense" | "income";
          created_at?: string;
          updated_at?: string;
        };
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          deadline: string | null;
          category: string;
          status: "on_track" | "urgent" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          category?: string;
          deadline?: string | null;
          status?: "on_track" | "urgent" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          category?: string;
          deadline?: string | null;
          status?: "on_track" | "urgent" | "completed";
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          messages: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "monthly" | "yearly";
          status: "active" | "inactive" | "cancelled";
          paystack_ref: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "monthly" | "yearly";
          status?: "active" | "inactive" | "cancelled";
          paystack_ref?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "free" | "monthly" | "yearly";
          status?: "active" | "inactive" | "cancelled";
          paystack_ref?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      survival_calculations: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          daily_spend: number;
          days_remaining: number;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance: number;
          daily_spend: number;
          days_remaining: number;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          daily_spend?: number;
          days_remaining?: number;
          calculated_at?: string;
        };
      };
    };
  };
}


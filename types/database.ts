/**
 * Tipagem do banco, no formato esperado pelo supabase-js.
 * Escrita à mão para o schema em /supabase/migrations.
 *
 * Se preferir gerar automaticamente depois:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 */

export type TaskCategory =
  | 'trabalho'
  | 'casa'
  | 'alimentacao'
  | 'familia'
  | 'treino'
  | 'espiritual'
  | 'compromisso';

export type TaskScope = 'today' | 'this_week' | 'delegated';

export type TaskPeriod = 'manha' | 'tarde' | 'noite';

export type PermissionKey =
  | 'manage_users'
  | 'manage_roles'
  | 'create_task'
  | 'view_all_tasks'
  | 'edit_others_tasks'
  | 'receive_delegated_task';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          key: PermissionKey | string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string;
          role_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      task_completions: {
        Row: {
          task_id: string;
          date: string;
          completed_by: string | null;
          completed_at: string;
        };
        Insert: {
          task_id: string;
          date: string;
          completed_by?: string | null;
          completed_at?: string;
        };
        Update: {
          task_id?: string;
          date?: string;
          completed_by?: string | null;
          completed_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          category: TaskCategory;
          scope: TaskScope;
          date: string | null;
          period: TaskPeriod | null;
          time: string | null;
          delegated_to: string | null;
          created_by: string;
          is_done: boolean;
          is_recurring: boolean;
          recurrence_rule: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: TaskCategory;
          scope?: TaskScope;
          date?: string | null;
          period?: TaskPeriod | null;
          time?: string | null;
          delegated_to?: string | null;
          created_by: string;
          is_done?: boolean;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: TaskCategory;
          scope?: TaskScope;
          date?: string | null;
          period?: TaskPeriod | null;
          time?: string | null;
          delegated_to?: string | null;
          created_by?: string;
          is_done?: boolean;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      has_permission: {
        Args: { p_key: string };
        Returns: boolean;
      };
      current_role_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      my_permissions: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      can_receive_delegation: {
        Args: { p_profile_id: string };
        Returns: boolean;
      };
      can_view_task: {
        Args: { p_task_id: string };
        Returns: boolean;
      };
      can_toggle_task: {
        Args: { p_task_id: string };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  category: '餐饮' | '外卖' | '学习用品' | '交通' | '娱乐' | '其他';
  expense_date: string;
  notes: string;
  created_at: string;
}

export const CATEGORIES = ['餐饮', '外卖', '学习用品', '交通', '娱乐', '其他'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  '餐饮': '#3b82f6',
  '外卖': '#f59e0b',
  '学习用品': '#10b981',
  '交通': '#8b5cf6',
  '娱乐': '#ef4444',
  '其他': '#6b7280',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  '餐饮': '🍜',
  '外卖': '🛵',
  '学习用品': '📚',
  '交通': '🚌',
  '娱乐': '🎮',
  '其他': '📌',
};

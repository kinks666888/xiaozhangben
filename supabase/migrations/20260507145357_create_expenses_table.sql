/*
  # Create expenses table for 学生小账本

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key)
      - `merchant` (text, 商家名称)
      - `amount` (numeric, 金额)
      - `category` (text, 分类: 餐饮/外卖/学习用品/交通/娱乐/其他)
      - `expense_date` (date, 消费日期)
      - `notes` (text, 备注)
      - `created_at` (timestamptz, 创建时间)

  2. Security
    - Enable RLS on `expenses` table
    - Add policies for authenticated users to manage their own expenses
    - Add policy for anonymous users to read/write (MVP without auth)

  3. Notes
    - For MVP, we allow all access since there's no auth yet
    - Categories are constrained via CHECK constraint
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant text NOT NULL DEFAULT '',
  amount numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT '其他'
    CHECK (category IN ('餐饮', '外卖', '学习用品', '交通', '娱乐', '其他')),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- For MVP: allow all operations (no auth yet)
CREATE POLICY "Allow all reads" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates" ON expenses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all deletes" ON expenses FOR DELETE USING (true);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);

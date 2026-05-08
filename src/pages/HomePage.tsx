import { useState, useEffect } from 'react';
import { supabase, type Expense, CATEGORY_COLORS, CATEGORY_ICONS, type Category } from '../lib/supabase';
import { PieChart } from '../components/PieChart';

export function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', monthStart)
      .order('expense_date', { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const monthTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const weekTotal = expenses
    .filter((e) => e.expense_date >= weekStartStr)
    .reduce((s, e) => s + Number(e.amount), 0);

  const categoryData = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {})
  )
    .map(([category, amount]) => ({ category: category as Category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-xs mb-1">本月支出</p>
          <p className="text-2xl font-bold">¥{monthTotal.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200">
          <p className="text-emerald-100 text-xs mb-1">本周支出</p>
          <p className="text-2xl font-bold">¥{weekTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">本月分类支出</h3>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <PieChart data={categoryData} size={180} />
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start">
            {categoryData.map((d) => (
              <div key={d.category} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
                />
                <span className="text-slate-500">
                  {CATEGORY_ICONS[d.category]} {d.category}
                </span>
                <span className="text-slate-700 font-medium">¥{d.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">最近记录</h3>
        {loading ? (
          <p className="text-slate-400 text-sm text-center py-4">加载中...</p>
        ) : recentExpenses.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">暂无记录，快去记一笔吧</p>
        ) : (
          <div className="space-y-2.5">
            {recentExpenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-2">
                <span className="text-lg">{CATEGORY_ICONS[e.category as Category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{e.merchant || e.category}</p>
                  <p className="text-xs text-slate-400">{e.expense_date}</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">-¥{Number(e.amount).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

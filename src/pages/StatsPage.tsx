import { useState, useEffect } from 'react';
import { supabase, type Expense, CATEGORY_COLORS, CATEGORY_ICONS, type Category } from '../lib/supabase';
import { PieChart } from '../components/PieChart';

export function StatsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'week'>('month');

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

  const filtered = period === 'month' ? expenses : expenses.filter((e) => e.expense_date >= weekStartStr);

  const categoryData = Object.entries(
    filtered.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {})
  )
    .map(([category, amount]) => ({ category: category as Category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  // Generate summary
  const topCategory = categoryData[0];
  const topPercent = topCategory ? Math.round((topCategory.amount / total) * 100) : 0;

  const summaries: string[] = [];
  if (topCategory) {
    summaries.push(
      `这个月${topCategory.category}花得最多，占了${topPercent}%（¥${topCategory.amount.toFixed(2)}）`
    );
  }
  if (categoryData.length > 1) {
    const second = categoryData[1];
    summaries.push(`其次是${second.category}，花了 ¥${second.amount.toFixed(2)}`);
  }
  const avgDaily = total / (period === 'month' ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() : 7);
  summaries.push(`平均每天支出 ¥${avgDaily.toFixed(2)}`);

  return (
    <div className="space-y-5">
      {/* Period Toggle */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex">
        <button
          onClick={() => setPeriod('month')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            period === 'month' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          本月
        </button>
        <button
          onClick={() => setPeriod('week')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            period === 'week' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          本周
        </button>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 text-center">
        <p className="text-blue-100 text-xs mb-1">{period === 'month' ? '本月' : '本周'}总支出</p>
        <p className="text-3xl font-bold">¥{total.toFixed(2)}</p>
        <p className="text-blue-100 text-xs mt-1">{filtered.length} 笔消费</p>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">分类占比</h3>
        {loading ? (
          <p className="text-slate-400 text-sm text-center py-8">加载中...</p>
        ) : categoryData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">暂无数据</p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <PieChart data={categoryData} size={180} />
            <div className="space-y-2.5 flex-1">
              {categoryData.map((d) => {
                const pct = total > 0 ? Math.round((d.amount / total) * 100) : 0;
                return (
                  <div key={d.category} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
                    />
                    <span className="text-sm text-slate-600 flex-1">
                      {CATEGORY_ICONS[d.category]} {d.category}
                    </span>
                    <span className="text-sm font-medium text-slate-700">¥{d.amount.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">智能总结</h3>
        {filtered.length === 0 ? (
          <p className="text-slate-400 text-sm">暂无数据</p>
        ) : (
          <div className="space-y-2">
            {summaries.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <p className="text-sm text-slate-600">{s}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Bar Chart */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">分类对比</h3>
          <div className="space-y-3">
            {categoryData.map((d) => {
              const pct = total > 0 ? (d.amount / total) * 100 : 0;
              return (
                <div key={d.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">
                      {CATEGORY_ICONS[d.category]} {d.category}
                    </span>
                    <span className="text-xs font-medium text-slate-600">¥{d.amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CATEGORY_COLORS[d.category],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

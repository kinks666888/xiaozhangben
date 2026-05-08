import { useState, useEffect } from 'react';
import { supabase, type Expense, CATEGORIES, CATEGORY_ICONS, type Category } from '../lib/supabase';
import { Trash2, Pencil, X, Check } from 'lucide-react';

export function RecordsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  }

  async function deleteExpense(id: string) {
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function startEdit(e: Expense) {
    setEditingId(e.id);
    setEditForm({ ...e });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    const { error } = await supabase
      .from('expenses')
      .update({
        merchant: editForm.merchant,
        amount: editForm.amount,
        category: editForm.category,
        expense_date: editForm.expense_date,
        notes: editForm.notes,
      })
      .eq('id', editingId);
    if (!error) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === editingId ? { ...e, ...editForm } as Expense : e))
      );
    }
    setEditingId(null);
    setEditForm({});
  }

  // Group by date
  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    const date = e.expense_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">全部记录</p>
          <p className="text-lg font-bold text-slate-700">{expenses.length} 条</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">总支出</p>
          <p className="text-lg font-bold text-blue-600">¥{totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm text-center py-8">加载中...</p>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">暂无记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center justify-between px-1 mb-2">
                <p className="text-xs font-medium text-slate-400">{date}</p>
                <p className="text-xs text-slate-400">
                  ¥{grouped[date].reduce((s, e) => s + Number(e.amount), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                {grouped[date].map((e) =>
                  editingId === e.id ? (
                    <div key={e.id} className="p-3 space-y-2">
                      <input
                        type="text"
                        value={editForm.merchant || ''}
                        onChange={(ev) => setEditForm({ ...editForm, merchant: ev.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="商家"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount || ''}
                        onChange={(ev) =>
                          setEditForm({ ...editForm, amount: parseFloat(ev.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="金额"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, category: cat })}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                              editForm.category === cat
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {CATEGORY_ICONS[cat]} {cat}
                          </button>
                        ))}
                      </div>
                      <input
                        type="date"
                        value={editForm.expense_date || ''}
                        onChange={(ev) => setEditForm({ ...editForm, expense_date: ev.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> 保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-500 text-sm"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-3 group">
                      <span className="text-lg">{CATEGORY_ICONS[e.category as Category]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{e.merchant}</p>
                        <p className="text-xs text-slate-400">{e.category}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 shrink-0">
                        -¥{Number(e.amount).toFixed(2)}
                      </p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => startEdit(e)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

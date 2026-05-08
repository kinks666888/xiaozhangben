import { useState, useRef } from 'react';
import { supabase, CATEGORIES, type Category, CATEGORY_ICONS } from '../lib/supabase';
import { Camera, Upload, X, Loader2 } from 'lucide-react';

interface ScanResult {
  merchant: string;
  amount: number;
  date: string;
  category: Category;
}

export function ScanPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setResult(null);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function analyzeImage() {
    if (!preview) return;
    setAnalyzing(true);
    setResult(null);

    // Simulate AI recognition with a delay
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

    const merchants = ['麦当劳', '星巴克', '学校食堂', '新华书店', '滴滴出行', '美团外卖', '蜜雪冰城', '文具店'];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];

    const categoryMap: Record<string, Category> = {
      '麦当劳': '餐饮',
      '星巴克': '餐饮',
      '学校食堂': '餐饮',
      '新华书店': '学习用品',
      '滴滴出行': '交通',
      '美团外卖': '外卖',
      '蜜雪冰城': '餐饮',
      '文具店': '学习用品',
    };

    const amount = parseFloat((Math.random() * 80 + 5).toFixed(2));
    const today = new Date().toISOString().split('T')[0];

    setResult({
      merchant,
      amount,
      date: today,
      category: categoryMap[merchant] || '其他',
    });
    setAnalyzing(false);
  }

  async function saveRecord() {
    if (!result) return;
    setSaving(true);
    const { error } = await supabase.from('expenses').insert({
      merchant: result.merchant,
      amount: result.amount,
      category: result.category,
      expense_date: result.date,
      notes: '',
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setSaved(false);
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">拍照 / 上传小票</h3>

        {!preview ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Camera className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-sm text-slate-500">点击拍照或上传小票图片</p>
            <p className="text-xs text-slate-400">支持 JPG、PNG 格式</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="小票预览"
                className="w-full max-h-64 object-contain rounded-xl bg-slate-50"
              />
              <button
                onClick={reset}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!result && !analyzing && (
              <button
                onClick={analyzeImage}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm hover:from-blue-600 hover:to-cyan-600 active:scale-[0.98] transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                开始识别
              </button>
            )}

            {analyzing && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-500">AI 正在识别小票内容...</p>
              </div>
            )}

            {result && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 space-y-3 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-700">识别结果</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">商家</p>
                    <p className="text-sm font-medium text-slate-700">{result.merchant}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">金额</p>
                    <p className="text-sm font-bold text-blue-600">¥{result.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">日期</p>
                    <p className="text-sm font-medium text-slate-700">{result.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">分类</p>
                    <p className="text-sm font-medium text-slate-700">
                      {CATEGORY_ICONS[result.category]} {result.category}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {!saved ? (
                    <button
                      onClick={saveRecord}
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {saving ? '保存中...' : '确认保存'}
                    </button>
                  ) : (
                    <button
                      onClick={reset}
                      className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 active:scale-[0.98] transition-all"
                    >
                      继续识别
                    </button>
                  )}
                  <button
                    onClick={reset}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm hover:bg-slate-200 transition-colors"
                  >
                    重新拍照
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Quick Add */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">快速手动记账</h3>
        <QuickAddForm />
      </div>
    </div>
  );
}

function QuickAddForm() {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('餐饮');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    setSaving(true);
    const { error } = await supabase.from('expenses').insert({
      merchant: merchant || category,
      amount: parseFloat(amount),
      category,
      expense_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setMerchant('');
      setAmount('');
      setCategory('餐饮');
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="商家名称（可选）"
        value={merchant}
        onChange={(e) => setMerchant(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all border border-slate-100"
      />
      <input
        type="number"
        step="0.01"
        min="0"
        placeholder="金额"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all border border-slate-100"
        required
      />
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === cat
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm hover:from-blue-600 hover:to-cyan-600 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-blue-200"
      >
        {saved ? '已保存!' : saving ? '保存中...' : '记一笔'}
      </button>
    </form>
  );
}

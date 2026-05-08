import { useState } from 'react';
import { Home, ScanLine, ListTodo, BarChart3, Menu, X } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { ScanPage } from './pages/ScanPage';
import { RecordsPage } from './pages/RecordsPage';
import { StatsPage } from './pages/StatsPage';

type Page = 'home' | 'scan' | 'records' | 'stats';

const NAV_ITEMS: { key: Page; label: string; icon: typeof Home }[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'scan', label: '扫一扫', icon: ScanLine },
  { key: 'records', label: '我的记录', icon: ListTodo },
  { key: 'stats', label: '统计分析', icon: BarChart3 },
];

function App() {
  const [page, setPage] = useState<Page>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function navigate(p: Page) {
    setPage(p);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-slate-100 flex-col z-20">
        <div className="p-5 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-800">学生小账本</h1>
          <p className="text-xs text-slate-400 mt-0.5">轻松记账，明白消费</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                page === key
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-300 text-center">v1.0 MVP</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="text-base font-bold text-slate-800">学生小账本</h1>
          <div className="w-8" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <h1 className="text-lg font-bold text-slate-800">学生小账本</h1>
              <p className="text-xs text-slate-400 mt-0.5">轻松记账，明白消费</p>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => navigate(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    page === key
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-56 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-5">
          {page === 'home' && <HomePage />}
          {page === 'scan' && <ScanPage />}
          {page === 'records' && <RecordsPage />}
          {page === 'stats' && <StatsPage />}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-slate-100">
        <div className="flex">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                page === key ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;

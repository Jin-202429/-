import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ChevronRight, 
  User, 
  Settings,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Inbox,
  Send,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { classifyMessages, Priority, type ClassifiedMessage } from './services/gemini';

// Mock raw messages to simulate incoming notifications
const INITIAL_RAW_MESSAGES = [
  { id: 1, sender: "김영수 팀장", channel: "Slack", subject: "회의 자료", body: "내일 오전 10시 클라이언트 미팅 자료 오늘 퇴근 전까지 꼭 공유 부탁드립니다." },
  { id: 2, sender: "박동혁 교수", channel: "Email", subject: "과제 공지", body: "이번 주 캡스톤 디자인 중간 보고서 마감이 금요일 오후 6시입니다. 늦지 않게 제출하세요." },
  { id: 3, sender: "쿠팡", channel: "SMS", subject: "할인 안내", body: "[광고] 봄맞이 특가 세일! 최대 70% 할인 쿠폰이 도착했습니다." },
  { id: 4, sender: "이서연 (동료)", channel: "Slack", subject: "코드 리뷰", body: "어제 올린 PR 확인 부탁드립니다. 시간 되실 때 천천히 보셔도 됩니다." },
  { id: 5, sender: "배달의민족", channel: "App", subject: "배달 완료", body: "주문하신 음식이 문 앞에 도착했습니다. 맛있게 드세요!" },
  { id: 6, sender: "인사팀", channel: "Email", subject: "워크샵 안내", body: "다음 달 전사 워크샵 일정 관련하여 설문 참여 부탁드립니다. (참고용 공지)" },
  { id: 7, sender: "HR 매니저", channel: "Email", subject: "면접 일정", body: "다음 주 월요일 오후 2시 1차 면접 일정이 확정되었습니다. 확인 부탁드립니다." },
];

export default function App() {
  const [messages, setMessages] = useState<any[]>(INITIAL_RAW_MESSAGES);
  const [classified, setClassified] = useState<ClassifiedMessage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [userContext, setUserContext] = useState('직급: 대리, 소속: 개발팀, 교수님 성함: 박동혁, 직속상사: 김영수');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const results = await classifyMessages(messages, userContext);
      setClassified(results);
      if (results.length > 0) setSelectedId(results[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedItem = classified.find(item => item.id === selectedId);
  const selectedOriginal = messages.find(m => m.id === selectedId);

  const filteredClassified = classified.filter(item => {
    return filter === 'all' || item.priority === filter;
  });

  return (
    <div className="flex h-screen bg-[#F4F5F7] font-sans text-[#1A1D21] overflow-hidden">
      {/* Slim Sidebar */}
      <aside className="w-16 bg-[#1A1D21] flex flex-col items-center py-6 gap-8">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl">H</div>
        <div className="flex flex-col gap-6 opacity-60">
          <SidebarIcon active><Inbox className="w-6 h-6 text-white" /></SidebarIcon>
          <SidebarIcon><Bell className="w-6 h-6 text-white" /></SidebarIcon>
          <SidebarIcon><User className="w-6 h-6 text-white" /></SidebarIcon>
          <SidebarIcon><Settings className="w-6 h-6 text-white" /></SidebarIcon>
        </div>
        <div className="mt-auto opacity-40 hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-slate-500 cursor-pointer" title="Settings" />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight">Harness AI Priority Engine</h1>
            <span className="px-2 py-0.5 bg-indigo-50/50 text-indigo-600 text-[10px] font-bold rounded border border-indigo-100 uppercase tracking-wider">v2.4.0 Active</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Daily Efficiency</p>
              <p className="text-sm font-semibold text-emerald-600">+{classified.length > 0 ? "42" : "0"} mins saved today</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Sparkles className={cn("w-3 h-3", isAnalyzing && "animate-spin")} />
              {isAnalyzing ? "Processing..." : "Run Analysis"}
            </motion.button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* List Section */}
          <section className="w-[380px] bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={cn("flex-1 py-1.5 text-[10px] font-bold rounded border transition-all", 
                  filter === 'all' ? "bg-white border-gray-200 shadow-sm text-slate-900" : "text-gray-400 border-transparent hover:bg-gray-100"
                )}
              >
                All ({classified.length})
              </button>
              <button 
                onClick={() => setFilter(Priority.URGENT)}
                className={cn("flex-1 py-1.5 text-[10px] font-bold rounded border transition-all",
                  filter === Priority.URGENT ? "bg-red-50 border-red-100 text-red-600 shadow-sm" : "text-gray-400 border-transparent hover:bg-red-50 hover:text-red-400"
                )}
              >
                URGENT ({classified.filter(c => c.priority === Priority.URGENT).length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
              {classified.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-medium">Ready for analysis</p>
                </div>
              ) : (
                filteredClassified.map(item => {
                  const original = messages.find(m => m.id === item.id);
                  const isUrgent = item.priority === Priority.URGENT;
                  const isToday = item.priority === Priority.TODAY;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "p-3 rounded-r-lg border-l-4 cursor-pointer transition-all",
                        selectedId === item.id ? "shadow-md z-10" : "hover:bg-gray-50",
                        isUrgent ? cn("bg-red-50 border-red-500", selectedId === item.id ? "ring-1 ring-red-200" : "") : 
                        isToday ? cn("bg-indigo-50/30 border-indigo-500") : 
                        "border-gray-200 bg-white"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn("text-[9px] font-bold uppercase tracking-tight", 
                          isUrgent ? "text-red-600" : isToday ? "text-indigo-600" : "text-gray-400"
                        )}>
                          {original?.channel} / {original?.sender.split(' ')[0]}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-gray-400 opacity-60">Score: {isUrgent ? "98%" : isToday ? "85%" : "62%"}</span>
                      </div>
                      <h3 className="text-xs font-bold truncate text-slate-800">{item.summary}</h3>
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{item.reason}</p>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Context Intelligence</label>
              <textarea 
                className="w-full p-2 text-[10px] border border-gray-200 rounded bg-white h-16 resize-none outline-none focus:border-indigo-400 transition-colors"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Job description, team members, keywords..."
              />
            </div>
          </section>

          {/* Detail Section */}
          <section className="flex-1 bg-white flex flex-col overflow-hidden">
            {selectedItem ? (
              <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-end mb-8">
                  <div className="space-y-2">
                    <div className={cn("flex items-center gap-2", 
                      selectedItem.priority === Priority.URGENT ? "text-red-500" : "text-indigo-500"
                    )}>
                      <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                        selectedItem.priority === Priority.URGENT ? "bg-red-500" : "bg-indigo-500"
                      )}></div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{selectedItem.priority} Analysis</span>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{selectedItem.summary}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-5 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Mark Processed</button>
                    <button className="px-5 py-2 border border-gray-200 text-[11px] font-bold rounded-lg hover:bg-gray-50 transition-all">Dismiss</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-wider">AI Reasoning Signal</h4>
                    <div className="space-y-4">
                      <SignalBar label="Sender Credibility" value={selectedItem.priority === Priority.URGENT ? 92 : 75} color="bg-emerald-500" />
                      <SignalBar label="Urgency Keywords" value={selectedItem.priority === Priority.URGENT ? 95 : 40} color="bg-red-500" />
                      <SignalBar label="Context Alignment" value={82} color="bg-indigo-500" />
                    </div>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-wider">Extract Summary</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase tracking-tighter shadow-sm">{selectedItem.priority}</span>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-tighter shadow-sm">{selectedOriginal?.channel}</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold rounded uppercase tracking-tighter">{selectedOriginal?.sender.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 border border-gray-100 rounded-2xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest border-l border-b border-indigo-100 rounded-bl-xl">AI Narrative</div>
                  <div className="mt-4">
                    <p className="text-xl leading-relaxed text-gray-800 font-medium">
                      발신인 <span className="text-indigo-600 font-bold underline decoration-indigo-200 underline-offset-4">{selectedOriginal?.sender}</span>님으로부터 수신된 메시지는 
                      <span className="px-1.5 py-0.5 bg-yellow-100 rounded mx-1">"{selectedItem.summary}"</span> 
                      내용을 핵심으로 하고 있습니다. {selectedItem.reason}
                    </p>
                  </div>

                  <div className="mt-12 p-6 bg-gray-50 border-dashed border-2 border-gray-200 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Suggested Action</p>
                    <p className="text-sm font-semibold text-gray-700 mb-4">{selectedItem.action}</p>
                    <div className="flex gap-4">
                      <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group/btn">
                        Execute Suggested Action <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                      <button className="text-xs font-bold text-gray-400 hover:text-gray-600">Later</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-gray-100 mb-6 group hover:scale-105 transition-transform">
                  <Zap className="w-10 h-10 text-indigo-200 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Select a prioritized item</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-xs text-center leading-relaxed">
                  Click on an analyzed card from the left panel to see full AI reasoning and action suggestions.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="h-8 bg-gray-50 border-t border-gray-200 px-6 flex items-center justify-between text-[10px] font-medium text-gray-400">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 group cursor-pointer hover:text-emerald-600 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AI System Status: Active
            </span>
            <span>Latency: 142ms</span>
            <span>Efficiency Boost: +24%</span>
          </div>
          <div>© 2024 Harness AI. Processing prioritization at scale.</div>
        </footer>
      </main>
    </div>
  );
}

function SidebarIcon({ children, active }: { children: React.ReactNode, active?: boolean }) {
  return (
    <div className={cn(
      "p-2 rounded-lg transition-all cursor-pointer relative group",
      active ? "bg-indigo-500/10 opacity-100" : "hover:bg-white/5"
    )}>
      {children}
      {active && <div className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_indigo]" />}
    </div>
  );
}

function SignalBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-gray-600">{label}</span>
      <div className="flex items-center gap-3">
         <span className="text-[10px] font-mono font-bold text-gray-400">{value}%</span>
         <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn("h-full", color)} 
          />
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, count = 0, active = false }: { icon: React.ReactNode, label: string, count?: number, active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all",
      active ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}>
      <div className={active ? "text-indigo-600" : "text-slate-400"}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <span className="flex-1 text-sm">{label}</span>
      {count > 0 && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold",
          active ? "bg-indigo-200 text-indigo-700" : "bg-slate-100 text-slate-500"
        )}>
          {count}
        </span>
      )}
    </div>
  );
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
        active ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
      )}
    >
      {children}
    </button>
  );
}

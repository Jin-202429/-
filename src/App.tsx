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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userContext, setUserContext] = useState('직급: 대리, 소속: 개발팀, 교수님 성함: 박동혁, 직속상사: 김영수');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const results = await classifyMessages(messages, userContext);
      setClassified(results);
    } catch (error) {
      console.error(error);
      alert("AI 분석 중 오류가 발생했습니다. API 키를 확인해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    setClassified(prev => prev.filter(m => m.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case Priority.URGENT: return "bg-rose-50 text-rose-600 border-rose-100";
      case Priority.TODAY: return "bg-amber-50 text-amber-600 border-amber-100";
      case Priority.REFERENCE: return "bg-slate-50 text-slate-600 border-slate-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case Priority.URGENT: return <AlertCircle className="w-4 h-4" />;
      case Priority.TODAY: return <Clock className="w-4 h-4" />;
      case Priority.REFERENCE: return <Inbox className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const filteredClassified = classified.filter(item => {
    const matchesFilter = filter === 'all' || item.priority === filter;
    const matchesSearch = item.summary.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-100 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Zap className="fill-current w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">FocusFlow</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<Inbox />} label="All Notifications" count={messages.length} active />
          <SidebarItem icon={<AlertCircle className="text-rose-500" />} label="Urgent" count={classified.filter(c => c.priority === Priority.URGENT).length} />
          <SidebarItem icon={<Clock className="text-amber-500" />} label="Today" count={classified.filter(c => c.priority === Priority.TODAY).length} />
          <SidebarItem icon={<CheckCircle2 className="text-emerald-500" />} label="Resolved" count={0} />
          
          <div className="pt-6 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Context Settings
          </div>
          <div className="px-3 pb-4">
            <textarea 
              className="w-full p-2 text-xs border border-slate-200 rounded-md bg-slate-50 focus:ring-1 focus:ring-indigo-500 outline-none h-24 resize-none"
              placeholder="User context (job, team, teachers...)"
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">User Admin</p>
              <p className="text-xs text-slate-400 truncate">Pro Plan</p>
            </div>
            <Settings className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search priorities, reasons..." 
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/50 border-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-full outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50",
                isAnalyzing && "animate-pulse"
              )}
            >
              <Sparkles className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
              {isAnalyzing ? "Analyzing..." : "Classify All"}
            </motion.button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Smart Inbox</h1>
                <p className="text-slate-500 mt-1">AI-driven notification priority classification.</p>
              </div>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
                <FilterButton active={filter === Priority.URGENT} onClick={() => setFilter(Priority.URGENT)}>Urgent</FilterButton>
                <FilterButton active={filter === Priority.TODAY} onClick={() => setFilter(Priority.TODAY)}>Today</FilterButton>
                <FilterButton active={filter === Priority.REFERENCE} onClick={() => setFilter(Priority.REFERENCE)}>Reference</FilterButton>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="space-y-4">
              {classified.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl text-center px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">No Classification Yet</h3>
                  <p className="text-slate-500 max-w-sm mt-2">
                    Click the <b>"Classify All"</b> button to let AI categorize your {messages.length} notifications based on your current context.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredClassified.map((item, index) => {
                    // Find original message to get sender and channel
                    const original = messages.find(m => m.id === item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer relative overflow-hidden"
                      >
                        {/* Background flare based on priority */}
                        <div className={cn(
                          "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity",
                          item.priority === Priority.URGENT ? "bg-rose-500" :
                          item.priority === Priority.TODAY ? "bg-amber-500" : "bg-slate-500"
                        )} />

                        <div className="flex gap-5 relative z-10">
                          {/* Left Icon Section */}
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center border",
                            getPriorityColor(item.priority)
                          )}>
                            {getPriorityIcon(item.priority)}
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                {original?.channel || "Unknown"}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-xs font-semibold text-slate-600">
                                {original?.sender || "Unknown Sender"}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{item.summary}</h3>
                            
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-slate-500 leading-relaxed">
                                  <span className="font-semibold text-slate-700">Reason:</span> {item.reason}
                                </p>
                              </div>
                              <div className="flex items-start gap-2 bg-indigo-50/40 p-3 rounded-lg border border-indigo-100/50 mt-2">
                                <Zap className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-indigo-700">
                                  <span className="font-semibold text-indigo-900">Action:</span> {item.action}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right Action Section */}
                          <div className="flex flex-col items-end justify-between pl-4">
                            <div className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm",
                              getPriorityColor(item.priority)
                            )}>
                              {item.priority}
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMessage(item.id);
                              }}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Manual Entry or Raw Messages Section */}
            <div className="pt-12 border-t border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Incoming Sources</h2>
                  <p className="text-sm text-slate-500">Unfiltered messages waiting for analysis.</p>
                </div>
                <button 
                  onClick={() => {
                    const newId = messages.length + 1;
                    setMessages(prev => [...prev, { 
                      id: newId, 
                      sender: "New Sender", 
                      channel: "Direct", 
                      subject: "New Message", 
                      body: "Type your message here..." 
                    }]);
                  }}
                  className="p-2 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 transition-colors"
                >
                  <Plus className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {messages.map((m) => (
                  <div key={m.id} className="bg-white border border-slate-100 rounded-xl p-4 group">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.channel}</span>
                        <span className="text-sm font-bold text-slate-800">{m.sender}</span>
                      </div>
                      <button onClick={() => deleteMessage(m.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100 italic">
                      "{m.body}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
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

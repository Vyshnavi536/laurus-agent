import { LogOut, MessageSquarePlus, MessageSquare, Trash2, Zap, X } from 'lucide-react';

export default function Sidebar({ history, onLogout, onNewChat, onDeleteChat, onClearAllChats, onClose }) {
  return (
    <div className="w-full lg:w-72 bg-[#0d1117] text-white h-full flex flex-col border-r border-white/5 relative z-20">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-3 font-display">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap size={20} className="text-white fill-current" />
          </div>
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Laurus</span>
        </h1>
        <button 
          onClick={onClose}
          className="lg:hidden p-1 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="px-4 mb-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 font-medium active:scale-95"
        >
          <MessageSquarePlus size={18} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <div className="flex items-center justify-between px-3 mb-3">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">
            History
          </div>
          {history && history.length > 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClearAllChats();
              }}
              className="text-[10px] text-slate-500 hover:text-red-400 transition-all uppercase font-bold tracking-[0.1em] hover:scale-105 active:scale-95"
            >
              Clear All
            </button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="px-3 py-4 text-sm text-slate-600 italic text-center glass-card rounded-xl">
            No history.
          </div>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer text-sm transition-all border border-transparent hover:border-white/5">
              <div className="flex items-center gap-3 truncate flex-1">
                <MessageSquare size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                <div className="truncate text-slate-400 group-hover:text-slate-200 transition-colors">
                  {msg.message}
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(msg.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-600 transition-all ml-2"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-slate-500 hover:text-white transition-all w-full p-3 hover:bg-white/5 rounded-xl group"
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

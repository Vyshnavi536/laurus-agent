import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Menu, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/history');
      const userQueries = response.data.filter(h => h.is_user);
      setHistory(userQueries.reverse()); 
      
      const formattedMessages = response.data.map(h => ({
        id: h.id,
        sender: h.is_user ? 'user' : 'ai',
        text: h.message
      }));
      setMessages(formattedMessages);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
    window.location.reload();
  };

  const handleNewChat = () => {
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete chat', err);
    }
  };

  const handleClearAllChats = () => {
    setShowClearModal(true);
  };

  const confirmClearAll = async () => {
    try {
      await api.delete('/history/clear');
      setMessages([]);
      setHistory([]);
      setShowClearModal(false);
      await fetchHistory();
    } catch (err) {
      console.error('Failed to clear history', err);
      alert('Could not clear history. Please check your connection.');
      setShowClearModal(false);
    }
  };

  const handleSend = async (e, directMessage = null) => {
    if (e) e.preventDefault();
    const userMessage = directMessage || input.trim();
    if (!userMessage) return;

    if (!directMessage) setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await api.post('/chat', { message: userMessage });
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
      fetchHistory(); 
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-transparent relative">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          history={history} 
          onLogout={handleLogout} 
          onNewChat={handleNewChat} 
          onDeleteChat={handleDeleteChat}
          onClearAllChats={handleClearAllChats}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      <div className="flex-1 flex flex-col relative bg-transparent min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 backdrop-blur-md bg-white/2 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
              <span className="text-blue-400 font-bold text-xl font-display">L</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white font-display leading-none truncate max-w-[150px] sm:max-w-none">
                Pharma Assistant
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Active
              </p>
            </div>
          </div>
        </header>

        <ChatBox 
          messages={messages} 
          isTyping={isTyping} 
          onDeleteChat={handleDeleteChat} 
          onSendMessage={(text) => handleSend(null, text)}
        />

        <div className="p-4 sm:p-6 bg-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <form onSubmit={handleSend} className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] sm:rounded-[28px] overflow-hidden p-1 sm:p-1.5 transition-all focus-within:border-white/20">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="w-full pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-4 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 resize-none h-[50px] sm:h-[60px] max-h-32 text-[15px] sm:text-[16px] leading-relaxed"
                rows="1"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 sm:p-3 bg-blue-600 text-white rounded-[14px] sm:rounded-[20px] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="mt-3 text-center text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-600 font-semibold truncate px-2">
              Medical Intelligence • Derived from FDA & Kaggle
            </div>
          </div>
        </div>
      </div>
      {showClearModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm p-6 sm:p-8 rounded-[28px] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="h-14 w-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-red-500/20">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2 font-display">Clear all history?</h3>
            <p className="text-slate-400 text-center text-sm leading-relaxed mb-8">
              This will permanently delete all your pharmaceutical queries and AI responses. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmClearAll}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
              >
                Clear Everything
              </button>
              <button 
                onClick={() => setShowClearModal(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-semibold transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

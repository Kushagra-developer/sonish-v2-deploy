import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Send, Database, Package, Settings, Activity } from 'lucide-react';
import API from '../../utils/api';
import { authJsonFetch } from '../../utils/authFetch';

const AdminAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([
    { role: 'assistant', text: 'Admin identity verified. I am your website operations assistant. I can help you pull orders, change inventory, or analyze sales data. How can I assist you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLogs(prev => [...prev, { role: 'admin', text: message }]);
    const cmd = message.toLowerCase();
    setMessage('');
    setIsTyping(true);

    try {
      const res = await authJsonFetch(`${API}/api/assistant`, {
        method: 'POST',
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      setLogs(prev => [...prev, { role: 'assistant', text: data.message || "Command processed." }]);
    } catch (err) {
      setLogs(prev => [...prev, { role: 'assistant', text: "Failed to connect to the Admin AI core." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const executeQuickAction = (actionName) => {
    setLogs(prev => [...prev, { role: 'admin', text: `Execute quick action: ${actionName}` }]);
    setIsTyping(true);
    setTimeout(() => {
       setLogs(prev => [...prev, { role: 'assistant', text: `Executing operations sequence for '${actionName}' now...` }]);
       setIsTyping(false);
    }, 1000);
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-20 left-0 w-[350px] sm:w-[400px] bg-white border border-charcoal/10 shadow-2xl rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-charcoal text-gold px-5 py-4 flex items-center justify-between border-b-2 border-gold">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                <div>
                  <h3 className="font-serif text-[15px] tracking-widest uppercase">Operations AI</h3>
                  <p className="text-[10px] text-white/50 tracking-wider">SECURE ADMIN CONSOLE</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-4 bg-offwhite py-2 px-3 border-b border-charcoal/5 gap-2">
              <button 
                onClick={() => executeQuickAction('Sync Database')}
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-white transition-colors text-charcoal"
              >
                <Database className="w-4 h-4 mb-1 text-gold" />
                <span className="text-[9px] uppercase tracking-wider text-center">Sync Data</span>
              </button>
              <button 
                onClick={() => executeQuickAction('Manage Inventory')}
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-white transition-colors text-charcoal"
              >
                <Package className="w-4 h-4 mb-1 text-gold" />
                <span className="text-[9px] uppercase tracking-wider text-center">Inventory</span>
              </button>
              <button 
                onClick={() => executeQuickAction('View Analytics')}
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-white transition-colors text-charcoal"
              >
                <Activity className="w-4 h-4 mb-1 text-gold" />
                <span className="text-[9px] uppercase tracking-wider text-center">Traffic</span>
              </button>
              <button 
                onClick={() => executeQuickAction('System Settings')}
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-white transition-colors text-charcoal"
              >
                <Settings className="w-4 h-4 mb-1 text-gold" />
                <span className="text-[9px] uppercase tracking-wider text-center">Settings</span>
              </button>
            </div>

            {/* Chat Body */}
            <div className="h-72 p-5 overflow-y-auto bg-white flex flex-col gap-4">
              {logs.map((log, idx) => (
                <div key={idx} className={`flex ${log.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    log.role === 'admin' 
                      ? 'bg-charcoal text-white rounded-br-none' 
                      : 'bg-offwhite text-charcoal rounded-bl-none shadow-sm shadow-charcoal/5'
                  }`}>
                    <p className="leading-relaxed">{log.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-offwhite text-charcoal/50 rounded-lg rounded-bl-none p-3 text-sm flex gap-1 items-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-charcoal/40 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-charcoal/40 rounded-full animate-bounce delay-200"></div>
                      <div className="w-1.5 h-1.5 bg-charcoal/40 rounded-full animate-bounce delay-300"></div>
                   </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-4 bg-offwhite/50 border-t border-charcoal/10">
              <form onSubmit={handleCommand} className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter administrator command..."
                  className="flex-1 bg-white border border-charcoal/10 px-4 py-2.5 rounded-md text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!message.trim() || isTyping}
                  className="w-10 h-10 rounded-md bg-gold text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors shadow-md"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-charcoal border-2 border-gold text-gold rounded-xl shadow-2xl flex items-center justify-center hover:bg-black transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default AdminAssistant;

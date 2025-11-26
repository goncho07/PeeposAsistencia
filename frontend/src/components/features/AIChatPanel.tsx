import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Loader2, Send } from 'lucide-react';

const apiKey = ""; 

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const AIChatPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'ai', text: "Hola Director(a). Soy el Asistente Peepos." }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!input.trim()) return;
    const userMsg = input; setMessages(prev => [...prev, { role: 'user', text: userMsg }]); setInput(''); setLoading(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Eres un asistente administrativo escolar para Peepos en Perú. Usuario: "${userMsg}". Responde de forma breve y profesional.` }] }] })
        });
      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error de respuesta.";
      setMessages(prev => [...prev, { role: 'ai', text: botText }]);
    } catch (error) { setMessages(prev => [...prev, { role: 'ai', text: "Error de conexión." }]); } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>{isOpen && (
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="absolute bottom-6 right-6 w-80 bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-blue-100 dark:border-slate-700 z-50 overflow-hidden flex flex-col h-[500px]">
          <div className="bg-blue-600 dark:bg-blue-700 p-4 flex justify-between items-center text-white shrink-0"><div className="flex items-center gap-2"><Bot size={20} /><span className="font-bold text-sm">Asistente Peepos</span></div><button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button></div>
          <div className="p-4 flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950 space-y-3 scrollbar-thin">{messages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-gray-200 text-gray-700 shadow-sm rounded-tl-none border border-gray-100 dark:border-slate-700'}`}>{msg.text}</div></div>))}{loading && <div className="flex justify-start"><div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm"><Loader2 size={14} className="animate-spin text-blue-600" /></div></div>}<div ref={messagesEndRef} /></div>
          <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2 shrink-0"><input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Consulta..." /><button type="submit" disabled={loading} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"><Send size={16} /></button></form>
        </motion.div>
      )}</AnimatePresence>
  );
};

export default AIChatPanel;
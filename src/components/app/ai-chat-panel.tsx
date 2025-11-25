"use client";

import { chatWithAssistant, ChatWithAssistantInput } from "@/ai/flows/ai-chat-assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const AIChatPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'ai', text: "Hola Director(a). Soy el Asistente Peepos." }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAssistant({ message: userMsg });
      setMessages(prev => [...prev, { role: 'ai', text: response.response }]);
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Lo siento, no puedo responder en este momento." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="absolute bottom-6 right-6 w-80 bg-card rounded-3xl shadow-2xl border z-50 overflow-hidden flex flex-col h-[500px]"
        >
          <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold text-sm">Asistente Peepos</span>
            </div>
            <button onClick={onClose} className="hover:bg-primary-foreground/20 p-1 rounded-full">
              <X size={18} />
            </button>
          </div>

          <ScrollArea className="p-4 flex-1 bg-background/70">
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-card text-foreground rounded-tl-none border'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-card p-3 rounded-2xl rounded-tl-none shadow-sm border">
                    <Loader2 size={14} className="animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-3 bg-card border-t flex gap-2 shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-background rounded-xl px-3 py-2 text-xs h-9 focus-visible:ring-1"
              placeholder="Consulta..."
            />
            <Button type="submit" disabled={loading} size="icon" className="w-9 h-9">
              <Send size={16} />
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

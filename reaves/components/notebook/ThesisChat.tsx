'use client';

import { useState, useRef, useEffect } from 'react';
import { SavedThesis, ChatMessage, NotebookEntry } from '@/types';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThesisChatProps {
  thesis: SavedThesis;
  entries: NotebookEntry[];
  onUpdateChat: (messages: ChatMessage[]) => void;
}

export default function ThesisChat({ thesis, entries, onUpdateChat }: ThesisChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(thesis.chat_history || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const sources = entries.map((e) => ({
        title: e.source.title,
        authors: e.source.authors,
        year: e.source.year,
        abstract: e.source.abstract,
      }));

      const res = await fetch('/api/thesis-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, thesis, sources }),
      });

      if (!res.ok) throw new Error('Chat API failed');
      const data = await res.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply };
      const updatedMessages = [...newMessages, assistantMsg];
      setMessages(updatedMessages);
      onUpdateChat(updatedMessages); // persist to localStorage
    } catch {
      const errMsg: ChatMessage = { role: 'assistant', content: '⚠️ Sorry, something went wrong. Please try again.' };
      const updatedMessages = [...newMessages, errMsg];
      setMessages(updatedMessages);
      onUpdateChat(updatedMessages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const suggestions = [
    'How can I strengthen this argument?',
    'What counterarguments should I anticipate?',
    'Help me draft an outline',
    'What evidence best supports this thesis?',
  ];

  return (
    <div className="flex flex-col h-[360px]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/15 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-violet-400" />
            </div>
            <p className="text-xs text-white/40">Ask me anything about this thesis</p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-white/8 bg-white/3 text-white/35 hover:text-white/60 hover:border-violet-500/25 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="h-5 w-5 rounded-md bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-violet-400" />
              </div>
            )}
            <div className={cn(
              'max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed',
              msg.role === 'user'
                ? 'bg-violet-600 text-white rounded-br-sm'
                : 'bg-white/5 border border-white/8 text-white/65 rounded-bl-sm'
            )}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="h-5 w-5 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-3 w-3 text-white/40" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="h-5 w-5 rounded-md bg-violet-600/20 flex items-center justify-center flex-shrink-0">
              <Bot className="h-3 w-3 text-violet-400" />
            </div>
            <div className="bg-white/5 border border-white/8 rounded-xl rounded-bl-sm px-3 py-2 text-xs text-white/35 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking…
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about this thesis…"
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/65 placeholder-white/20 outline-none focus:border-violet-500/40 transition-colors disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="h-8 w-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-white/15 text-white flex items-center justify-center transition-all shadow-lg shadow-violet-500/20 disabled:shadow-none"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

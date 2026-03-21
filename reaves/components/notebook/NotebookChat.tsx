'use client';

import { useState, useRef, useEffect } from 'react';
import { NotebookEntry, ChatMessage } from '@/types';
import { Send, Bot, User, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotebookChatProps {
  entries: NotebookEntry[];
  notebookName: string;
}

export default function NotebookChat({ entries, notebookName }: NotebookChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages are added
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
      // Build sources context from notebook entries
      const sources = entries.map((e) => ({
        title: e.source.title,
        authors: e.source.authors,
        year: e.source.year,
        journal: e.source.journal,
        trust_score: e.source.trust_score,
        trust_reason: e.source.trust_reason,
        abstract: e.source.abstract,
        user_note: e.user_note,
        tag: e.tag,
      }));

      const res = await fetch('/api/notebook-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sources }),
      });

      if (!res.ok) throw new Error('Chat API failed');

      const data = await res.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Sorry, I couldn\'t process that. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const suggestedQuestions = [
    'Summarize all my sources',
    'Which sources contradict each other?',
    'What are the key findings?',
    'Suggest research gaps',
  ];

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/2 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-violet-600/30 flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-violet-300" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/80">Research Chat</h3>
          <p className="text-[10px] text-white/30">
            {entries.length} source{entries.length !== 1 ? 's' : ''} loaded as context
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-600/10 border border-violet-500/15 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/50">Ask me anything about your sources</p>
              <p className="text-xs text-white/25 mt-1">I have context on all {entries.length} sources in &quot;{notebookName}&quot;</p>
            </div>
            {/* Suggested questions */}
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="text-[10px] px-3 py-1.5 rounded-full border border-white/8 bg-white/3 text-white/40 hover:text-white/70 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="h-6 w-6 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-violet-400" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed',
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-white/5 border border-white/8 text-white/70 rounded-bl-sm'
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-white/50" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <div className="bg-white/5 border border-white/8 rounded-xl rounded-bl-sm px-3.5 py-2.5 text-xs text-white/40 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking…
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/5 bg-white/2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your sources…"
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white/70 placeholder-white/20 outline-none focus:border-violet-500/40 transition-colors disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="h-9 w-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-white/15 text-white flex items-center justify-center transition-all shadow-lg shadow-violet-500/20 disabled:shadow-none"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

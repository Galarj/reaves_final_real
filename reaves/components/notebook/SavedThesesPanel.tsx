'use client';

import { useState } from 'react';
import { SavedThesis, NotebookEntry } from '@/types';
import { useNotebooks } from '@/lib/notebook-context';
import { cn } from '@/lib/utils';
import ThesisChat from './ThesisChat';
import {
  BookMarked, Trash2, ChevronDown, ChevronUp,
  MessageSquare, Target, Lightbulb, BookOpen
} from 'lucide-react';

interface SavedThesesPanelProps {
  theses: SavedThesis[];
  entries: NotebookEntry[];
}

export default function SavedThesesPanel({ theses, entries }: SavedThesesPanelProps) {
  const { removeThesis, updateThesisChat } = useNotebooks();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (theses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center">
          <BookMarked className="h-5 w-5 text-white/15" />
        </div>
        <p className="text-sm text-white/40 font-medium">No saved theses yet</p>
        <p className="text-xs text-white/25 max-w-xs">
          Go to the <span className="text-violet-400">Builder</span> tab, generate thesis angles, and click <span className="text-violet-400">Save</span> on any that interest you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
          <BookMarked className="h-3.5 w-3.5 text-violet-400" />
          {theses.length} saved {theses.length === 1 ? 'thesis' : 'theses'}
        </h3>
      </div>

      {theses.map((thesis) => {
        const isExpanded = expandedId === thesis.id;
        const hasChat = thesis.chat_history.length > 0;

        return (
          <div
            key={thesis.id}
            className={cn(
              'rounded-2xl border overflow-hidden transition-all',
              isExpanded
                ? 'border-violet-500/30 bg-violet-500/4'
                : 'border-white/8 bg-white/3'
            )}
          >
            {/* Thesis header */}
            <div className="p-4 space-y-2">
              {/* Stance badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400/80 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Thesis
                </span>
                <div className="flex items-center gap-1">
                  {hasChat && (
                    <span className="text-[10px] text-white/30 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {thesis.chat_history.length / 2 | 0} exchanges
                    </span>
                  )}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : thesis.id)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                    title={isExpanded ? 'Collapse' : 'Chat about this thesis'}
                  >
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => removeThesis(thesis.id)}
                    className="p-1.5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Remove thesis"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Thesis statement */}
              <p className="text-sm text-white/85 font-medium leading-snug">{thesis.thesis}</p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-xs text-white/40 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-amber-400/60" />
                  <span className="font-medium text-white/50">Stance:</span> {thesis.stance}
                </span>
                {thesis.gap_it_fills && (
                  <span className="text-xs text-white/35 flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-emerald-400/50" />
                    Gap: {thesis.gap_it_fills}
                  </span>
                )}
              </div>

              {/* Supporting sources */}
              {thesis.supporting_sources.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {thesis.supporting_sources.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-violet-500/15 text-violet-300 border border-violet-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Open chat hint when collapsed */}
              {!isExpanded && (
                <button
                  onClick={() => setExpandedId(thesis.id)}
                  className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-violet-400 transition-colors pt-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  {hasChat ? `Continue conversation (${Math.floor(thesis.chat_history.length / 2)} messages)` : 'Discuss this thesis with AI →'}
                </button>
              )}
            </div>

            {/* Per-thesis chat */}
            {isExpanded && (
              <div className="border-t border-white/5">
                <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs text-white/50 font-medium">Thesis Chat</span>
                </div>
                <ThesisChat
                  thesis={thesis}
                  entries={entries}
                  onUpdateChat={(msgs) => updateThesisChat(thesis.id, msgs)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

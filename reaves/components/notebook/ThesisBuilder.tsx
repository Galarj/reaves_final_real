'use client';

import { useState } from 'react';
import { NotebookEntry, ThesisResponse, ThesisAngle } from '@/types';
import { useNotebooks } from '@/lib/notebook-context';
import { cn } from '@/lib/utils';
import { Wand2, Loader2, CheckCircle, Target, BookOpen, Bookmark, BookmarkCheck, RefreshCw } from 'lucide-react';

interface ThesisBuilderProps {
  entries: NotebookEntry[];
  topic?: string;
}

export default function ThesisBuilder({ entries, topic }: ThesisBuilderProps) {
  const { saveThesis, activeNotebook } = useNotebooks();
  const [thesis, setThesis] = useState<ThesisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<number | null>(null);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());
  const [justSaved, setJustSaved] = useState<number | null>(null);

  const handleBuild = async () => {
    if (entries.length < 2) {
      setError('Save at least 2 sources to build a thesis.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setThesis(null);
    setSelectedAngle(null);
    setSavedIndices(new Set());

    try {
      const res = await fetch('/api/thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || 'General research topic',
          sources: entries.map((e) => e.source),
        }),
      });
      const data: ThesisResponse = await res.json();
      setThesis(data);
    } catch {
      setError('Failed to build thesis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (angle: ThesisAngle, index: number) => {
    saveThesis(angle);
    setSavedIndices((prev) => new Set(prev).add(index));
    setJustSaved(index);
    setTimeout(() => setJustSaved(null), 2000);
  };

  // Check if an angle is already saved in the notebook
  const isAlreadySaved = (angle: ThesisAngle) =>
    activeNotebook?.saved_theses?.some((t) => t.thesis === angle.thesis) ?? false;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-violet-600/30 flex items-center justify-center">
            <Target className="h-4 w-4 text-violet-300" />
          </div>
          <div>
            <p className="text-xs text-violet-400 font-medium uppercase tracking-wider">Thesis Builder</p>
            <p className="text-xs text-white/40 mt-0.5">{entries.length} source{entries.length !== 1 ? 's' : ''} in notebook</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {thesis && (
            <button
              onClick={handleBuild}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-40"
              title="Generate new thesis angles"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
              Regenerate
            </button>
          )}
          <button
            onClick={handleBuild}
            disabled={isLoading || entries.length < 2}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              entries.length >= 2 && !isLoading
                ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {thesis ? 'Build Again' : 'Build Thesis'}
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!thesis && !isLoading && !error && (
          <div className="text-center py-8">
            <BookOpen className="h-8 w-8 text-white/15 mx-auto mb-2" />
            <p className="text-sm text-white/30">
              {entries.length < 2
                ? `Save ${2 - entries.length} more source${entries.length === 1 ? '' : 's'} to enable thesis building`
                : 'Click "Build Thesis" to generate 3 thesis angles from your saved sources'
              }
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            <p className="text-sm text-white/40">Analyzing your sources and crafting thesis angles...</p>
          </div>
        )}

        {/* Results */}
        {thesis && (
          <div className="space-y-3">
            <p className="text-xs text-white/40 mb-4">
              Select a thesis angle to discuss further, or save it directly to your notebook
            </p>
            {thesis.angles.map((angle, i) => {
              const saved = savedIndices.has(i) || isAlreadySaved(angle);
              const isSelected = selectedAngle === i;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedAngle(i === selectedAngle ? null : i)}
                  className={cn(
                    'rounded-xl border p-4 cursor-pointer transition-all duration-200',
                    isSelected
                      ? 'border-violet-500/40 bg-violet-600/15'
                      : 'border-white/8 bg-white/2 hover:border-violet-500/20 hover:bg-white/4'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                      isSelected ? 'border-violet-400 bg-violet-600/40' : 'border-white/20'
                    )}>
                      {isSelected
                        ? <CheckCircle className="h-3.5 w-3.5 text-violet-300" />
                        : <span className="text-[10px] font-bold text-white/40">{i + 1}</span>
                      }
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 leading-snug">{angle.thesis}</p>
                      <p className="text-xs text-violet-400/70">
                        <span className="font-medium text-violet-400">Stance:</span> {angle.stance}
                      </p>
                      <p className="text-xs text-white/40">
                        Fills gap: {angle.gap_it_fills}
                      </p>
                      {angle.supporting_sources?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {angle.supporting_sources.map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Save button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); if (!saved) handleSave(angle, i); }}
                      disabled={saved}
                      className={cn(
                        'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        saved
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 cursor-default'
                          : 'border border-white/10 text-white/40 hover:text-white/70 hover:border-violet-500/30 hover:bg-violet-500/5'
                      )}
                      title={saved ? 'Saved to notebook' : 'Save this thesis to your notebook'}
                    >
                      {saved ? (
                        <>
                          <BookmarkCheck className="h-3.5 w-3.5" />
                          {justSaved === i ? 'Saved!' : 'Saved'}
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-3.5 w-3.5" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Send, Briefcase } from 'lucide-react';
import { ApplicationItem } from '../types';

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationItem | null;
  pitchData: { elevator_pitch: string; key_selling_points: string[]; cover_note_hook: string } | null;
  isLoading: boolean;
}

export const PitchModal: React.FC<PitchModalProps> = ({
  isOpen,
  onClose,
  application,
  pitchData,
  isLoading
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-violet-500/40 rounded-2xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Personalized Career Pitch Generator</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Deterministic Template Synthesis
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Positioning synthesized deterministically for <span className="text-violet-300 font-semibold">{application.company}</span> — {application.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading || !pitchData ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Synthesizing candidate strengths into a high-conversion pitch...</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Elevator Pitch Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-violet-500/30 relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  30-Second Verbal Elevator Pitch:
                </span>
                <button
                  onClick={() => handleCopy(pitchData.elevator_pitch, 'pitch')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  {copiedType === 'pitch' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Pitch</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                {pitchData.elevator_pitch}
              </p>
            </div>

            {/* Key Selling Points */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-2">Key Selling Points for Recruiter Screen:</h4>
              <ul className="space-y-1.5">
                {pitchData.key_selling_points.map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cover Note Opening Hook */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300">Application Cover Note Opening:</span>
                <button
                  onClick={() => handleCopy(pitchData.cover_note_hook, 'hook')}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 hover:text-white"
                >
                  {copiedType === 'hook' ? 'Copied!' : 'Copy Hook'}
                </button>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed bg-navy-950 p-2.5 rounded border border-slate-800/80">
                "{pitchData.cover_note_hook}"
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};


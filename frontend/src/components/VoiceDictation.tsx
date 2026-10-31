import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface VoiceDictationProps {
  questionText: string;
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onDurationChange: (seconds: number) => void;
  onSubmitForEvaluation: () => void;
  isEvaluating: boolean;
}

export const VoiceDictation: React.FC<VoiceDictationProps> = ({
  questionText,
  transcript,
  onTranscriptChange,
  onDurationChange,
  onSubmitForEvaluation,
  isEvaluating
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(1);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          } else {
            interimChunk += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          onTranscriptChange(transcript ? `${transcript} ${finalChunk.trim()}` : finalChunk.trim());
        }
        setInterimText(interimChunk);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err.error);
        if (err.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions or type your response in the box.');
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // Only restart if still marked as recording
        if (isRecording) {
          try {
            recognition.start();
          } catch {
            // ignore
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition setup failed:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, transcript, onTranscriptChange]);

  // Handle Recording Timer & Waveform animation
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          onDurationChange(next);
          return next;
        });
        setVolumeLevel(Math.floor(Math.random() * 4) + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, onDurationChange]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.log('Recognition start caught:', err);
      }
    }
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setInterimText('');
  };

  const resetRecording = () => {
    stopRecording();
    setRecordingSeconds(0);
    onDurationChange(0);
    onTranscriptChange('');
    setInterimText('');
  };

  // Speak question aloud using browser speech synthesis
  const handleSpeakQuestion = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Sample answer generator to let the candidate test instantly
  const handleFillSample = () => {
    const sample = "In my previous role as a Senior Frontend Engineer, our application struggled with unpredictable response times from LLM tools during high-volume customer inquiries. I stepped up to architect a resilient LangGraph multi-agent loop with checkpointing. I introduced strict Pydantic schema validation and hybrid RAG combining lexical BM25 with dense vector embeddings in Qdrant. Before approving external CRM tool executions, I integrated a human-in-the-loop review barrier. As a result, we reduced hallucination complaints by 68% and achieved sub-200ms perceived streaming latency for 15,000 daily active users.";
    onTranscriptChange(sample);
    onDurationChange(75);
    setRecordingSeconds(75);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-violet-500/20 p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Controls & Dictation Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={toggleRecording}
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all transform ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-4 ring-rose-500/30 scale-105'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 hover:scale-105'
              }`}
              title={isRecording ? 'Click to stop voice recording' : 'Click to begin voice recording'}
            >
              {isRecording ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
            </button>
            {isRecording && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">
                {isRecording ? 'Listening & Transcribing...' : 'Voice Dictation Mode'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                isRecording ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
              }`}>
                {formatTime(recordingSeconds)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isRecording
                ? 'Speak naturally into your microphone. Transcription updates live.'
                : speechSupported
                ? 'Click the microphone to record your verbal interview response.'
                : 'Microphone not supported on this browser; manual typing is enabled.'}
            </p>
          </div>
        </div>

        {/* Action Controls: Audio Playback, Quick Demo Fill, Reset */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSpeakQuestion}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isSpeaking
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700'
            }`}
            title="Listen to the interviewer read this question"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-violet-400" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Hear Question'}</span>
          </button>

          <button
            onClick={handleFillSample}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-950/60 hover:bg-violet-900/60 text-violet-300 border border-violet-800/60 transition-all"
            title="Paste an authentic high-performing sample answer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Sample Answer</span>
          </button>

          {(transcript || recordingSeconds > 0) && (
            <button
              onClick={resetRecording}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 transition-all"
              title="Reset response and timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Waveform Activity Bars */}
      {isRecording && (
        <div className="my-3 py-2 px-4 rounded-xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-violet-300">
            <Radio className="w-4 h-4 text-violet-400 animate-pulse" />
            <span>Acoustic Waveform Active</span>
          </div>
          <div className="flex items-center space-x-1.5 h-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
              const heightClass =
                bar % 3 === 0
                  ? 'h-5'
                  : bar % 2 === 0
                  ? 'h-3'
                  : 'h-6';
              return (
                <div
                  key={bar}
                  className={`w-1 rounded-full bg-gradient-to-t from-violet-500 to-purple-300 animate-pulse ${heightClass}`}
                  style={{ animationDelay: `${bar * 0.1}s` }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Live Transcript / Response Input Area */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span>Verbal Response & Live Transcript:</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {transcript ? `${transcript.split(/\s+/).filter(Boolean).length} words` : '0 words'}
          </span>
        </label>

        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening to your microphone... Speak clearly and explain your thinking.'
                : 'Click "Start Recording" above to speak, or write your response directly here. Pivot Pilot will evaluate your STAR structure, technical depth, and pivot narrative.'
            }
            rows={5}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-sans leading-relaxed resize-y"
          />

          {interimText && (
            <div className="absolute bottom-3 left-4 right-4 pointer-events-none text-xs text-violet-400 italic bg-navy-950/90 px-2 py-1 rounded border border-violet-500/20 truncate">
              Streaming: {interimText}
            </div>
          )}
        </div>
      </div>

      {/* Submission CTA */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="text-xs text-slate-400 flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>AI will evaluate using STAR rubric, technical depth, and pivot confidence.</span>
        </div>

        <button
          onClick={onSubmitForEvaluation}
          disabled={!transcript.trim() || isEvaluating}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            !transcript.trim() || isEvaluating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-600/30 border border-violet-400/40 hover:scale-[1.02]'
          }`}
        >
          {isEvaluating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Response...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-violet-200" />
              <span>Evaluate My Response</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};


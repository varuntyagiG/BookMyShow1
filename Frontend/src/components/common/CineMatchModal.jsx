import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Film,
  Star,
  Clock,
  ArrowRight,
  RotateCcw,
  Zap,
  CheckCircle2,
  Tv,
  Compass,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { contentApi } from '../../services/api';
import { matchMovieWithAI } from '../../utils/cineMatchEngine';
import { playPop, playChime } from '../../utils/soundEffects';

const QUICK_MOODS = [
  { id: 'scifi', label: 'Mind-Bending Sci-Fi', emoji: '🚀', query: 'Epic sci-fi movie like Interstellar or Dune with grand visuals' },
  { id: 'date', label: 'Romantic Date Night', emoji: '🍿', query: 'Romantic or fun comedy movie perfect for a couple date night' },
  { id: 'action', label: 'High-Octane Action', emoji: '💥', query: 'Adrenaline pumping action movie with intense combat and great sound' },
  { id: 'horror', label: 'Jump Scare Horror', emoji: '😱', query: 'Scary supernatural horror comedy with big crowd energy' },
  { id: 'family', label: 'Family Blockbuster', emoji: '👨‍👩‍👧', query: 'Wholesome entertaining movie for all ages with family' },
];

export default function CineMatchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [availableMovies, setAvailableMovies] = useState([]);
  const inputRef = useRef(null);

  // Fetch active movies catalog once
  useEffect(() => {
    async function loadMovies() {
      try {
        const res = await contentApi.getHomeData();
        if (res?.movies && Array.isArray(res.movies)) {
          setAvailableMovies(res.movies);
        }
      } catch (err) {
        console.warn('Could not load movies for CineMatch AI:', err.message);
      }
    }
    if (isOpen) {
      loadMovies();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAskAI = async (queryToUse) => {
    const targetQuery = (queryToUse || queryInput || '').trim();
    if (!targetQuery) return;

    playPop();
    setLoading(true);
    setResult(null);

    // Simulate natural AI thought delay (600ms) for realistic feel
    setTimeout(async () => {
      try {
        const aiResponse = await matchMovieWithAI(targetQuery, availableMovies);
        setResult(aiResponse);
        playChime();
      } catch (err) {
        console.error('CineMatch Error:', err);
      } finally {
        setLoading(false);
      }
    }, 700);
  };

  const handleSelectMovie = (movie) => {
    if (!movie) return;
    playPop();
    onClose?.();
    const movieId = movie._id || movie.customId || movie.id;
    navigate(`/movies/${movieId}`);
  };

  const handleReset = () => {
    playPop();
    setResult(null);
    setQueryInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-br from-[#12141f] via-[#161826] to-[#0e1017] text-white rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden my-auto">
        
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#1c1f30] to-[#141624] px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-[#F84464] to-amber-400 flex items-center justify-center shadow-lg shadow-violet-900/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>CineMatch</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F84464] to-amber-300 font-extrabold text-xs uppercase tracking-wider">
                    AI Concierge
                  </span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[9px] font-bold">
                  2.0 Beta
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Personalized movie recommendations tailored to your exact mood &amp; taste
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* Query Input Box */}
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAI();
              }}
              className="relative flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="What kind of movie or vibe are you looking for today?"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-[#F84464] rounded-2xl pl-4 pr-12 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-[#F84464] shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !queryInput.trim()}
                className="absolute right-2 p-2 bg-[#F84464] hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
                title="Ask AI"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Mood Shortcut Pills */}
          {!result && !loading && (
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Vibe Shortcuts:
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => {
                      setQueryInput(mood.query);
                      handleAskAI(mood.query);
                    }}
                    className="py-1.5 px-3 rounded-full bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 hover:border-[#F84464]/60 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Thinking / Processing State */}
          {loading && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-3 border-slate-800 border-t-[#F84464] border-r-violet-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  CineMatch AI is analyzing current movies...
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scanning genres, audience scores, critic consensus, and IMAX showtimes
                </p>
              </div>
            </div>
          )}

          {/* AI Recommendation Result Card */}
          {result && result.movie && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/60 to-slate-900/90 border border-slate-700/80 shadow-xl space-y-4"
            >
              {/* Match Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{result.matchScore}% Match</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Top Recommendation
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  title="Try another query"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Movie Presentation Grid */}
              <div className="flex items-start gap-4">
                {result.movie.posterUrl && (
                  <img
                    src={result.movie.posterUrl}
                    alt={result.movie.title}
                    className="w-20 sm:w-24 h-28 sm:h-34 object-cover rounded-xl shadow-lg border border-slate-700 shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-[#F84464]/20 border border-[#F84464]/40 text-[#F84464] text-[9px] font-black uppercase tracking-wider">
                      UA16+
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[9px] font-bold flex items-center gap-1">
                      <Tv className="w-2.5 h-2.5" />
                      {result.suggestedFormat}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {result.movie.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{result.movie.rating || '8.8'}/10</span>
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {Array.isArray(result.movie.genre) ? result.movie.genre.join(', ') : result.movie.genre}
                    </span>
                  </div>

                  {/* AI Rationale Bubble */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 mt-2 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-violet-400 font-bold text-[10px] uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Why you will love it:</span>
                    </div>
                    <p>{result.reason}</p>
                  </div>
                </div>
              </div>

              {/* Action Button: 1-Click to Showtimes & Seats */}
              <button
                type="button"
                onClick={() => handleSelectMovie(result.movie)}
                className="w-full py-3 bg-gradient-to-r from-[#F84464] hover:from-rose-500 to-rose-600 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-rose-900/30 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Tickets for {result.movie.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Footer Subtext */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Powered by BookMyShow Intelligent Match Engine
            </span>
            <span>Instant Results • Zero Latency</span>
          </div>

        </div>

      </div>
    </div>
  );
}

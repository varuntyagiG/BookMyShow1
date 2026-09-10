import React, { useState, useEffect } from 'react';
import { contentApi } from '../services/api';
import { Crown, Tv, ShieldCheck, Film, CheckCircle, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StreamPage() {
  const [premieres, setPremieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rentConfirmed, setRentConfirmed] = useState(false);
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    async function fetchStreamData() {
      try {
        const res = await contentApi.getCategoryItems('stream');
        if (res.success && res.items) {
          setPremieres(res.items);
        }
      } catch (err) {
        console.error('Failed to load stream items:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStreamData();
  }, []);

  const handleRent = (movie) => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    setSelectedMovie(movie);
    setRentConfirmed(false);
  };

  return (
    <div className="bg-[#121216] text-white min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stream Brand Hero Banner */}
        <div className="relative bg-gradient-to-br from-[#222432] via-[#1C2130] to-[#121216] rounded-3xl p-6 sm:p-10 lg:p-12 mb-10 sm:mb-12 border border-white/10 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
          {/* Ambient accent glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-[#F84464]/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 bg-[#F84464]/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F84464]/15 text-[#F84464] border border-[#F84464]/30 text-[11px] font-bold rounded-full mb-5 uppercase tracking-wider shadow-[0_0_20px_-6px_rgba(248,68,100,0.5)]">
              <Crown className="w-3.5 h-3.5" />
              <span>BookMyShow Stream</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white my-0 leading-[1.08]">
              The Cinema Comes Home.
            </h1>
            <p className="text-sm text-[#9A9BA5] mt-4 leading-relaxed font-medium max-w-lg">
              No monthly subscription needed. Pay only for what you watch. Rent or buy handpicked movies, global blockbusters, and critically acclaimed world cinema.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mt-9 sm:mt-10 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3.5 p-3 -m-3 rounded-xl transition-colors hover:bg-white/[0.03]">
              <div className="w-11 h-11 rounded-xl bg-[#F84464]/15 border border-[#F84464]/25 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-[#F84464]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white my-0">Premieres Every Friday</h2>
                <p className="text-xs text-[#9A9BA5] mt-0.5">Fresh theatrical releases straight to stream</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-3 -m-3 rounded-xl transition-colors hover:bg-white/[0.03]">
              <div className="w-11 h-11 rounded-xl bg-[#F84464]/15 border border-[#F84464]/25 flex items-center justify-center shrink-0">
                <Tv className="w-5 h-5 text-[#F84464]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white my-0">Stream on Any Device</h2>
                <p className="text-xs text-[#9A9BA5] mt-0.5">Smart TV, Mobile, Tablet, Laptop</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-3 -m-3 rounded-xl transition-colors hover:bg-white/[0.03]">
              <div className="w-11 h-11 rounded-xl bg-[#F84464]/15 border border-[#F84464]/25 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#F84464]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white my-0">Zero Commitments</h2>
                <p className="text-xs text-[#9A9BA5] mt-0.5">No monthly fees. Pay per title.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premieres Showcase */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white my-0">
                Weekly Premieres &amp; New Releases
              </h2>
              <p className="text-xs sm:text-sm text-[#9A9BA5] mt-1">Rent starts from ₹119 • Watch in 4K Ultra HD &amp; Dolby 5.1</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/5 bg-[#1C2130]/40">
              <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
              <p className="text-xs text-[#9A9BA5] font-medium">Loading stream catalogue...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {premieres.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1C2130] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#F84464]/60 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(248,68,100,0.35)] flex flex-col group"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#121216]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3 bg-[#F84464] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-[0_4px_12px_-2px_rgba(248,68,100,0.6)] uppercase tracking-wider">
                      {item.badge}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#F84464] transition-colors tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#9A9BA5] mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-[#9A9BA5] block uppercase font-semibold tracking-wide">Rent for 48 hrs</span>
                        <span className="text-sm font-extrabold text-white">{item.rentPrice || '₹149'}</span>
                      </div>
                      <button
                        onClick={() => handleRent(item)}
                        className="bg-[#F84464] hover:bg-[#E03A58] active:scale-[0.97] text-white text-xs font-extrabold py-2.5 px-5 rounded-lg transition-all duration-200 cursor-pointer shadow-[0_4px_14px_-4px_rgba(248,68,100,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2"
                      >
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Rent / Buy Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#1C2130] text-white rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] p-6 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute right-4 top-4 p-1.5 text-[#9A9BA5] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464]"
            >
              <X className="w-5 h-5" />
            </button>

            {!rentConfirmed ? (
              <div>
                <h3 className="text-lg font-bold mb-1.5">Rent {selectedMovie.title}</h3>
                <p className="text-xs text-[#9A9BA5] mb-6 leading-relaxed">You will have 30 days to start watching and 48 hours to finish once started.</p>

                <div className="bg-[#121216] p-4 rounded-xl text-xs space-y-3 mb-6 border border-white/[0.06]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9BA5]">Quality:</span>
                    <span className="font-bold text-white">4K UHD + Dolby Atmos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9BA5]">Rent Price:</span>
                    <span className="font-bold text-[#F84464] text-sm">{selectedMovie.rentPrice || '₹149'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setRentConfirmed(true)}
                  className="w-full py-3 bg-[#F84464] hover:bg-[#E03A58] active:scale-[0.98] text-white text-sm font-bold rounded-xl cursor-pointer transition-all duration-200 shadow-[0_10px_30px_-8px_rgba(248,68,100,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  Confirm &amp; Watch Now
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold mb-1.5">Rental Active!</h3>
                <p className="text-xs text-[#9A9BA5] mb-6 leading-relaxed">
                  Enjoy watching <strong className="text-white">{selectedMovie.title}</strong> on BookMyShow Stream.
                </p>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="w-full py-3 bg-[#F84464] hover:bg-[#E03A58] active:scale-[0.98] text-white text-sm font-bold rounded-xl cursor-pointer transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  Start Playback
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
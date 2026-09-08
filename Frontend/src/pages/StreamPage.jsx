import React, { useState, useEffect } from 'react';
import { contentApi } from '../services/api';
import { Play, Crown, Tv, ShieldCheck, Film, CheckCircle, X, Loader2 } from 'lucide-react';
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
    <div className="bg-[#181A20] text-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stream Brand Hero Banner */}
        <div className="bg-gradient-to-r from-[#2B3148] via-[#1F2533] to-[#2B3148] rounded-2xl p-8 sm:p-12 mb-10 border border-gray-700/40 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-full mb-4">
              <Crown className="w-3.5 h-3.5" />
              <span>BOOKMYSHOW STREAM</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white my-0">
              The Cinema Comes Home.
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed">
              No monthly subscription needed. Pay only for what you watch. Rent or buy handpicked movies, global blockbusters, and critically acclaimed world cinema.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-700/50">
            <div className="flex items-center gap-3">
              <Film className="w-6 h-6 text-[#F84464]" />
              <div>
                <h2 className="text-xs font-bold text-white my-0">Premieres Every Friday</h2>
                <p className="text-[11px] text-gray-400">Fresh theatrical releases straight to stream</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tv className="w-6 h-6 text-[#F84464]" />
              <div>
                <h2 className="text-xs font-bold text-white my-0">Stream on Any Device</h2>
                <p className="text-[11px] text-gray-400">Smart TV, Mobile, Tablet, Laptop</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#F84464]" />
              <div>
                <h2 className="text-xs font-bold text-white my-0">Zero Commitments</h2>
                <p className="text-[11px] text-gray-400">No monthly fees. Pay per title.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premieres Showcase */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white my-0">
                Weekly Premieres &amp; New Releases
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Rent starts from ₹119 • Watch in 4K Ultra HD &amp; Dolby 5.1</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-2" />
              <p className="text-xs text-gray-400">Loading stream catalogue...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {premieres.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#222634] rounded-xl overflow-hidden border border-gray-800 hover:border-[#F84464] transition-all flex flex-col group"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-900">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#F84464] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs">
                      {item.badge}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#F84464] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400 block">Rent for 48 hrs</span>
                        <span className="text-sm font-bold text-white">{item.rentPrice || '₹149'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRent(item)}
                          className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-2 px-4 rounded-md transition-colors cursor-pointer"
                        >
                          Rent Now
                        </button>
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-[#222634] text-white rounded-xl shadow-2xl p-6 border border-gray-700 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {!rentConfirmed ? (
              <div>
                <h3 className="text-base font-bold mb-1">Rent {selectedMovie.title}</h3>
                <p className="text-xs text-gray-400 mb-4">You will have 30 days to start watching and 48 hours to finish once started.</p>
                
                <div className="bg-gray-800/60 p-3 rounded-lg text-xs space-y-2 mb-5">
                  <div className="flex justify-between">
                    <span>Quality:</span>
                    <span className="font-bold text-white">4K UHD + Dolby Atmos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rent Price:</span>
                    <span className="font-bold text-[#F84464]">{selectedMovie.rentPrice || '₹149'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setRentConfirmed(true)}
                  className="w-full py-2.5 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Confirm &amp; Watch Now
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-base font-bold mb-1">Rental Active!</h3>
                <p className="text-xs text-gray-300 mb-4">
                  Enjoy watching <strong>{selectedMovie.title}</strong> on BookMyShow Stream.
                </p>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="w-full py-2 bg-[#F84464] text-white text-xs font-bold rounded-lg cursor-pointer"
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


import React from 'react';
import { PlayCircle, Crown, ChevronRight, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StreamSection({ premieres = [] }) {
  const navigate = useNavigate();
  if (!premieres.length) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-[#2B3148] via-[#222738] to-[#1A1D2A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stream Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#F84464] flex items-center justify-center text-white shadow-lg shadow-red-500/20 shrink-0">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">Premieres</span>
                <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Crown className="w-3 h-3" /> STREAM EXCLUSIVE
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5 font-medium">
                Brand new cinematic releases delivered straight to your home every Friday
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/stream')}
            className="flex items-center gap-1 text-xs font-bold text-[#F84464] hover:text-white transition-colors cursor-pointer self-start sm:self-auto group"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Explore All on Stream</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Premieres Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {premieres.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate('/stream')}
              className="bg-[#1A1F2C] rounded-xl overflow-hidden border border-gray-700/60 hover:border-[#F84464] shadow-lg transition-all duration-300 transform hover:-translate-y-1.5 group cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#F84464] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                  {item.badge}
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                  <div className="w-13 h-13 rounded-full bg-[#F84464] text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#F84464] transition-colors truncate tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium bg-white/5 px-2 py-0.5 rounded">{item.language}</span>
                  <span className="text-xs font-bold text-white bg-[#F84464] hover:bg-[#e03a58] px-3.5 py-1 rounded-md transition-colors shadow-xs">
                    Rent / Buy
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


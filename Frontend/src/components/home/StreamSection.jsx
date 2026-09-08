import React from 'react';
import { PlayCircle, Crown } from 'lucide-react';

export default function StreamSection({ premieres = [] }) {
  if (!premieres.length) return null;

  return (
    <section className="py-10 bg-[#2B3148] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stream Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#F84464] flex items-center justify-center text-white shadow-md">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">Premieres</span>
              <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> STREAM EXCLUSIVE
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Brand new cinematic releases delivered straight to your home every Friday
            </p>
          </div>
        </div>

        {/* Premieres Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {premieres.map((item) => (
            <div
              key={item.id}
              onClick={() => alert(`Renting / Streaming: ${item.title}`)}
              className="bg-[#1F2533] rounded-lg overflow-hidden border border-gray-700/50 hover:border-[#F84464] transition-all group cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-[#F84464] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs">
                  {item.badge}
                </div>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-[#F84464] text-white flex items-center justify-center shadow-lg">
                    <PlayCircle className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#F84464] transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">{item.language}</span>
                  <span className="text-[#F84464] font-bold">Rent / Buy</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


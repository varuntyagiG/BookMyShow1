import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Film, Volume2, Glasses } from 'lucide-react';
import Cinema3DExperience from '../3d/Cinema3DExperience';

export default function VIPCinema3DSection() {
  const navigate = useNavigate();

  const vipFeatures = [
    { icon: <Glasses className="w-4 h-4 text-rose-400" />, label: 'IMAX 3D Laser & High Frame Rate' },
    { icon: <Volume2 className="w-4 h-4 text-amber-400" />, label: 'Dolby Atmos 64-Channel Audio' },
    { icon: <Film className="w-4 h-4 text-indigo-400" />, label: 'Luxury VIP Recliner Lounges' },
    { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, label: 'Guaranteed Center-Row Seating' }
  ];

  return (
    <section className="relative overflow-hidden my-8 sm:my-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#181924] via-[#212332] to-[#151620] border border-slate-700/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] overflow-hidden">
          
          {/* Ambient Lighting Glows */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#F84464]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8 p-6 sm:p-10 relative z-10">
            
            {/* Left Column: Premium Cinematic Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F84464]/15 border border-[#F84464]/30 text-[#F84464] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#F84464]" />
                <span>Next-Gen Cinema Dimension</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Immerse Yourself in <span className="bg-gradient-to-r from-white via-rose-100 to-[#F84464] bg-clip-text text-transparent">Full 3D &amp; VIP Luxury</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Step beyond traditional cinema. Experience razor-sharp 3D projections, Dolby Atmos 360° sound, and in-seat gourmet dining with your exclusive BookMyTrip VIP pass.
              </p>

              {/* VIP Feature Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {vipFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
                      {feat.icon}
                    </div>
                    <span className="text-xs font-medium text-slate-200 text-left">
                      {feat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  type="button"
                  onClick={() => navigate('/movies')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F84464] to-[#e03a58] hover:from-[#e03a58] hover:to-[#c52c48] text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/25 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Explore VIP 3D Shows</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/cinemas')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  <span>Find IMAX Theatres</span>
                </button>
              </div>
            </div>

            {/* Right Column: Three.js Interactive 3D Canvas */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="w-full max-w-lg h-[340px] sm:h-[400px] lg:h-[440px] rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent p-2 border border-white/[0.05]">
                <Cinema3DExperience />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

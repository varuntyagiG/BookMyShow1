import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Mail, MessageSquare, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#181A26] text-gray-300 mt-auto overflow-hidden border-t border-white/[0.08]">

      {/* 3D Top Ambient Projector Beam */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#F84464] to-transparent shadow-[0_0_16px_rgba(248,68,100,0.85)]" />

      {/* 24/7 Customer Support & Help Row */}
      <div className="relative bg-[#1E2030]/80 py-10 border-b border-white/[0.08]">
        {/* Subtle Background Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F84464]/10 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ perspective: '1000px' }}>

            {/* Card 1: 24/7 Support */}
            <div
              style={{ transformStyle: 'preserve-3d' }}
              className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-[#F84464]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_30px_-8px_rgba(248,68,100,0.25)] flex flex-col items-center text-center group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#F84464]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div
                style={{ transform: 'translateZ(24px)' }}
                className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#F84464]/15 group-hover:border-[#F84464]/40 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(248,68,100,0.35)] transition-all duration-300"
              >
                <Headphones className="w-6 h-6 text-[#F84464]" />
              </div>
              <h5
                style={{ transform: 'translateZ(18px)' }}
                className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#F84464] transition-colors"
              >
                24/7 Customer Care
              </h5>
              <p
                style={{ transform: 'translateZ(12px)' }}
                className="text-[11px] text-gray-400 group-hover:text-gray-300 mt-1.5 max-w-xs transition-colors"
              >
                We are here to assist with bookings, refunds, and queries anytime
              </p>
            </div>

            {/* Card 2: Resend Booking Confirmation */}
            <div
              style={{ transformStyle: 'preserve-3d' }}
              className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-[#F84464]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_30px_-8px_rgba(248,68,100,0.25)] flex flex-col items-center text-center group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#F84464]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div
                style={{ transform: 'translateZ(24px)' }}
                className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#F84464]/15 group-hover:border-[#F84464]/40 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(248,68,100,0.35)] transition-all duration-300"
              >
                <MessageSquare className="w-6 h-6 text-[#F84464]" />
              </div>
              <h5
                style={{ transform: 'translateZ(18px)' }}
                className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#F84464] transition-colors"
              >
                Resend Booking Confirmation
              </h5>
              <p
                style={{ transform: 'translateZ(12px)' }}
                className="text-[11px] text-gray-400 group-hover:text-gray-300 mt-1.5 max-w-xs transition-colors"
              >
                Lost your ticket? Instant re-delivery to your registered mobile or email
              </p>
            </div>

            {/* Card 3: Subscribe to Newsletter */}
            <div
              style={{ transformStyle: 'preserve-3d' }}
              className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-[#F84464]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_30px_-8px_rgba(248,68,100,0.25)] flex flex-col items-center text-center group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#F84464]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div
                style={{ transform: 'translateZ(24px)' }}
                className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#F84464]/15 group-hover:border-[#F84464]/40 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(248,68,100,0.35)] transition-all duration-300"
              >
                <Mail className="w-6 h-6 text-[#F84464]" />
              </div>
              <h5
                style={{ transform: 'translateZ(18px)' }}
                className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#F84464] transition-colors"
              >
                Subscribe to Newsletter
              </h5>
              <p
                style={{ transform: 'translateZ(12px)' }}
                className="text-[11px] text-gray-400 group-hover:text-gray-300 mt-1.5 max-w-xs transition-colors"
              >
                Receive handpicked offers, upcoming movie alerts, and early bird passes
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F84464]" />
              <span>Movies by Language</span>
            </h5>
            <ul className="space-y-2.5 text-gray-400">
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Movies in Hindi</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Movies in English</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Movies in Telugu</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Movies in Tamil</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Movies in Malayalam</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F84464]" />
              <span>Movies by Genre</span>
            </h5>
            <ul className="space-y-2.5 text-gray-400">
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Action Movies</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Comedy &amp; Drama</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Romantic Blockbusters</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Sci-Fi &amp; Thriller</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Animation &amp; Family</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F84464]" />
              <span>Live Experiences</span>
            </h5>
            <ul className="space-y-2.5 text-gray-400">
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Music Concerts &amp; Tours</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Standup Comedy Specials</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Theatre &amp; Musical Plays</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Cricket &amp; Stadium Sports</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Theme Parks &amp; Activities</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F84464]" />
              <span>Help &amp; Support</span>
            </h5>
            <ul className="space-y-2.5 text-gray-400">
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">About BookMyShow</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Contact Support</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Terms &amp; Conditions</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Privacy Policy</a></li>
              <li className="pt-2">
                <Link
                  to="/vendor/login"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-[#F84464]/30 hover:border-[#F84464] hover:bg-[#F84464]/10 text-[#F84464] hover:text-[#ff6b85] font-semibold transition-all shadow-xs"
                >
                  <span>Cinema Partner Portal</span>
                  <span className="text-[9px] bg-[#F84464] text-white font-bold px-1.5 py-0.5 rounded shadow-xs">Partner</span>
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/30 text-gray-400 hover:text-white font-semibold transition-all text-xs"
                >
                  <span>Platform Super Admin</span>
                  <span className="text-[9px] bg-[#222738] text-gray-300 font-bold px-1.5 py-0.5 rounded border border-gray-600">Admin</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment and Security Strip */}
        <div className="mt-10 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Secure Payments:</span>
            <div className="flex flex-wrap items-center gap-2">
              {['VISA', 'Mastercard', 'UPI', 'RuPay', 'Net Banking'].map((method) => (
                <span
                  key={method}
                  className="bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-300 hover:border-white/20 transition-colors shadow-xs"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Bank-Grade Encryption</span>
          </div>
        </div>

        {/* Brand & Copyright */}
        <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-white tracking-tight">
              book<span className="text-[#F84464]">my</span>show
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 font-medium">Entertainment Redefined</span>
          </div>

          <p className="text-center sm:text-right text-gray-500">
            Copyright 2026 © Bigtree Entertainment Pvt. Ltd. All Rights Reserved. Replica for demonstration purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}

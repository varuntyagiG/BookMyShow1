import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Mail, MessageSquare, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#333545] text-gray-300 mt-auto">

      {/* 24/7 Customer Support & Help Row */}
      <div className="bg-[#404358] py-8 border-b border-gray-700/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-[#333545] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6 text-[#F84464]" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">24/7 Customer Care</h5>
              <p className="text-[11px] text-gray-300 mt-1 max-w-xs">We are here to assist with bookings, refunds, and queries anytime</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-[#333545] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-[#F84464]" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">Resend Booking Confirmation</h5>
              <p className="text-[11px] text-gray-300 mt-1 max-w-xs">Lost your ticket? Instant re-delivery to your registered mobile or email</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-[#333545] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-[#F84464]" />
              </div>
              <h5 className="text-xs font-black text-white uppercase tracking-wider">Subscribe to Newsletter</h5>
              <p className="text-[11px] text-gray-300 mt-1 max-w-xs">Receive handpicked offers, upcoming movie alerts, and early bird passes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>Movies by Language</span>
            </h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Movies in Hindi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Movies in English</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Movies in Telugu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Movies in Tamil</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Movies in Malayalam</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>Movies by Genre</span>
            </h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Action Movies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Comedy &amp; Drama</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Romantic Blockbusters</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sci-Fi &amp; Thriller</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Animation &amp; Family</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>Live Experiences</span>
            </h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Music Concerts &amp; Tours</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Standup Comedy Specials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Theatre &amp; Musical Plays</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cricket &amp; Stadium Sports</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Theme Parks &amp; Activities</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>Help &amp; Portals</span>
            </h5>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/cinema-partner/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">★ Cinema Partner Hub (B2B)</Link></li>
              <li><Link to="/admin/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1">⚡ Platform Admin Portal</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">About BookMyShow</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Payment and Security Strip */}
        <div className="mt-10 pt-6 border-t border-gray-700/60 flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Secure Payments:</span>
            <div className="flex items-center gap-2">
              <span className="bg-[#2B3148] px-2.5 py-1 rounded text-[10px] font-bold text-gray-300">VISA</span>
              <span className="bg-[#2B3148] px-2.5 py-1 rounded text-[10px] font-bold text-gray-300">Mastercard</span>
              <span className="bg-[#2B3148] px-2.5 py-1 rounded text-[10px] font-bold text-gray-300">UPI</span>
              <span className="bg-[#2B3148] px-2.5 py-1 rounded text-[10px] font-bold text-gray-300">RuPay</span>
              <span className="bg-[#2B3148] px-2.5 py-1 rounded text-[10px] font-bold text-gray-300">Net Banking</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit SSL Bank-Grade Encryption</span>
          </div>
        </div>

        {/* Brand & Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-700/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white tracking-tight">
              book<span className="text-[#F84464]">my</span>show
            </span>
            <span className="text-gray-600">|</span>
            <span>Entertainment Redefined</span>
          </div>

          <p className="text-center sm:text-right">
            Copyright 2026 © Bigtree Entertainment Pvt. Ltd. All Rights Reserved. Replica for demonstration purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}


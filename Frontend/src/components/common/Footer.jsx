import React from 'react';
import { Headphones, Mail, MessageSquare, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#333545] text-gray-300 mt-auto">
      {/* List Your Show Banner */}
      <div className="bg-[#2B3148] border-b border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-[#F84464] flex items-center justify-center text-white shrink-0 mx-auto sm:mx-0">
              <span className="text-lg font-bold">🎪</span>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">List your Show</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Got an event, comedy show, music gig or play? Partner with BookMyShow today!
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Contact our Partnerships team at partner@bookmyshow.com')}
            className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-2.5 px-6 rounded transition-colors shrink-0 cursor-pointer"
          >
            Contact today!
          </button>
        </div>
      </div>

      {/* 24/7 Customer Support & Help Row */}
      <div className="bg-[#404358] py-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Headphones className="w-8 h-8 text-[#F84464] mb-2" />
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">24/7 Customer Care</h5>
              <p className="text-[11px] text-gray-300 mt-1">We are here to help whenever you need us</p>
            </div>
            <div className="flex flex-col items-center">
              <MessageSquare className="w-8 h-8 text-[#F84464] mb-2" />
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Resend Booking Confirmation</h5>
              <p className="text-[11px] text-gray-300 mt-1">Get tickets sent to your email or SMS again</p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 text-[#F84464] mb-2" />
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Subscribe to Newsletter</h5>
              <p className="text-[11px] text-gray-300 mt-1">Receive handpicked offers and movie buzz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Movies by Language</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Movies in Hindi</a></li>
              <li><a href="#" className="hover:text-white">Movies in English</a></li>
              <li><a href="#" className="hover:text-white">Movies in Telugu</a></li>
              <li><a href="#" className="hover:text-white">Movies in Tamil</a></li>
              <li><a href="#" className="hover:text-white">Movies in Malayalam</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Movies by Genre</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Action Movies</a></li>
              <li><a href="#" className="hover:text-white">Comedy Movies</a></li>
              <li><a href="#" className="hover:text-white">Romantic Movies</a></li>
              <li><a href="#" className="hover:text-white">Sci-Fi &amp; Thriller</a></li>
              <li><a href="#" className="hover:text-white">Animation &amp; Kids</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Live Events</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Music Concerts</a></li>
              <li><a href="#" className="hover:text-white">Standup Comedy</a></li>
              <li><a href="#" className="hover:text-white">Theatre &amp; Plays</a></li>
              <li><a href="#" className="hover:text-white">Sports &amp; Tournaments</a></li>
              <li><a href="#" className="hover:text-white">Workshops &amp; Exhibitions</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Help &amp; Legal</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Terms &amp; Conditions</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Security &amp; Fraud Alert</a></li>
            </ul>
          </div>
        </div>

        {/* Brand & Copyright */}
        <div className="mt-10 pt-8 border-t border-gray-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">
              book<span className="text-[#F84464]">my</span>show
            </span>
            <span className="text-gray-500">|</span>
            <span>Entertainment at your fingertips</span>
          </div>

          <p className="text-center sm:text-right">
            Copyright 2026 © Bigtree Entertainment Pvt. Ltd. All Rights Reserved. Replica for demonstration purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}


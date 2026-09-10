import React from 'react';
import { Link } from 'react-router-dom';
import AdminStatusBadge from './AdminStatusBadge';
import {
  Calendar,
  Clock,
  Star,
  Edit2,
  Trash2,
  Film,
  Eye,
  EyeOff,
  Archive,
  Ticket,
  ExternalLink
} from 'lucide-react';

export default function AdminMovieCard({
  movie,
  onEdit,
  onStatusChange,
  onDelete
}) {
  const movieId = movie.id || movie._id;
  const currentStatus = movie.status || 'published';
  const genres = Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || 'Action');
  const formats = Array.isArray(movie.formats) ? movie.formats : (typeof movie.formats === 'string' ? movie.formats.split(',').map(f => f.trim()) : ['2D']);
  const theatreCount = Array.isArray(movie.theatres) ? movie.theatres.length : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group hover:-translate-y-1">
      {/* Poster Media Anchor */}
      <div className="relative aspect-[3/4] bg-gray-900 overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop';
          }}
        />

        {/* Gradient Overlay for badges & text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5">
            {movie.certificate && (
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-wider border border-white/20">
                {movie.certificate}
              </span>
            )}
            {movie.isPromoted && (
              <span className="px-2 py-0.5 rounded-md bg-[#F84464] text-white font-black text-[10px] uppercase tracking-wider shadow-md shadow-[#F84464]/40">
                Trending
              </span>
            )}
          </div>

          <div className="pointer-events-auto">
            <AdminStatusBadge status={currentStatus} size="xs" />
          </div>
        </div>

        {/* Bottom Poster Info (Rating & Formats) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black">{movie.rating || 8.0}</span>
            <span className="text-[10px] text-gray-300 font-medium">/ 10</span>
          </div>

          {formats.length > 0 && (
            <div className="flex items-center gap-1">
              {formats.slice(0, 2).map((fmt, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider"
                >
                  {fmt}
                </span>
              ))}
              {formats.length > 2 && (
                <span className="text-[9px] font-bold text-gray-300">
                  +{formats.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            className="text-base font-black text-[#222432] group-hover:text-[#F84464] transition-colors line-clamp-1"
            title={movie.title}
          >
            {movie.title}
          </h3>

          <p className="text-[11px] text-gray-500 font-medium line-clamp-1 mt-0.5">
            {genres}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-2">
            <span className="font-semibold text-gray-700">{movie.language || 'Hindi, English'}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3 h-3 text-gray-400" />
              {movie.duration || '2h 15m'}
            </span>
          </div>
        </div>

        {/* Release date & Theatres linked */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span>{movie.releaseDate || 'In Theatres'}</span>
          </span>

          <Link
            to={`/admin/shows?movie=${movieId}`}
            className="flex items-center gap-1 font-bold text-gray-700 hover:text-[#F84464] transition"
            title="View scheduled showtimes"
          >
            <Ticket className="w-3 h-3 text-[#F84464]" />
            <span>{theatreCount} {theatreCount === 1 ? 'Venue' : 'Venues'}</span>
          </Link>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-gray-100/80">
          {/* Status Quick Switcher */}
          <div className="flex items-center gap-1">
            {currentStatus === 'published' ? (
              <button
                onClick={() => onStatusChange(movie, 'archived')}
                title="Archive (hide from customer app)"
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onStatusChange(movie, 'published')}
                title="Publish (make live on customer app)"
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            <Link
              to={`/admin/shows?movie=${movieId}`}
              title="Schedule Shows & Theatres"
              className="px-2.5 py-1.5 rounded-lg bg-[#F84464]/10 hover:bg-[#F84464]/20 text-[#F84464] font-bold text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Shows</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(movie)}
              title="Edit Movie Details"
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(movie)}
              title="Delete Movie"
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

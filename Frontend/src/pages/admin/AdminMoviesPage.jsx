import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Film,
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  PageHeader,
  Input,
  Select,
  Modal,
  ConfirmModal,
  EmptyState,
  Skeleton,
  CopyBadge,
  CopyButton
} from '../../components/ui';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / Edit Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    isEdit: false,
    movieId: null,
    submitting: false,
    formData: {
      title: '',
      synopsis: '',
      genre: 'Action, Adventure',
      language: 'Hindi',
      certificate: 'UA',
      duration: '2h 30m',
      releaseDate: 'Coming Soon',
      rating: 8.5,
      posterUrl: '',
      backdropUrl: '',
      formats: '2D, 3D, IMAX',
      cities: 'Mumbai, Delhi-NCR, Bengaluru',
      status: 'published'
    }
  });

  // Archive Confirmation Modal
  const [archiveModal, setArchiveModal] = useState({
    isOpen: false,
    movie: null,
    loading: false
  });

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMovies({ search, status: statusFilter });
      if (res.success) {
        setMovies(res.movies || []);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setModal({
      isOpen: true,
      isEdit: false,
      movieId: null,
      submitting: false,
      formData: {
        title: '',
        synopsis: '',
        genre: 'Action, Adventure',
        language: 'Hindi',
        certificate: 'UA',
        duration: '2h 30m',
        releaseDate: '15 Oct, 2026',
        rating: 8.5,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
        formats: '2D, 3D, IMAX',
        cities: 'Mumbai, Delhi-NCR, Bengaluru',
        status: 'published'
      }
    });
  };

  const handleOpenEdit = (movie) => {
    setModal({
      isOpen: true,
      isEdit: true,
      movieId: movie._id,
      submitting: false,
      formData: {
        title: movie.title || '',
        synopsis: movie.synopsis || '',
        genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || ''),
        language: movie.language || 'Hindi',
        certificate: movie.certificate || 'UA',
        duration: movie.duration || '2h 30m',
        releaseDate: movie.releaseDate || 'Coming Soon',
        rating: movie.rating || 8.5,
        posterUrl: movie.posterUrl || '',
        backdropUrl: movie.backdropUrl || '',
        formats: Array.isArray(movie.formats) ? movie.formats.join(', ') : (movie.formats || '2D'),
        cities: Array.isArray(movie.cities) ? movie.cities.join(', ') : (movie.cities || 'Mumbai, Delhi-NCR'),
        status: movie.status || 'published'
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModal((prev) => ({ ...prev, submitting: true }));

    try {
      const payload = {
        ...modal.formData,
        genre: modal.formData.genre.split(',').map((g) => g.trim()),
        formats: modal.formData.formats.split(',').map((f) => f.trim()),
        cities: modal.formData.cities.split(',').map((c) => c.trim()),
        rating: Number(modal.formData.rating) || 8.0
      };

      if (modal.isEdit) {
        const res = await adminApi.updateMovie(modal.movieId, payload);
        if (res.success) {
          setMovies((prev) =>
            prev.map((m) => (m._id === modal.movieId ? { ...m, ...payload } : m))
          );
          setModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
        }
      } else {
        const res = await adminApi.createMovie(payload);
        if (res.success && res.movie) {
          setMovies((prev) => [res.movie, ...prev]);
          setModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
        }
      }
    } catch (err) {
      console.error('Failed to save movie:', err);
      setModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleConfirmArchive = async () => {
    const movie = archiveModal.movie;
    if (!movie) return;

    setArchiveModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await adminApi.deleteMovie(movie._id);
      if (res.success) {
        setMovies((prev) => prev.map((m) => (m._id === movie._id ? { ...m, status: 'archived' } : m)));
        setArchiveModal({ isOpen: false, movie: null, loading: false });
      }
    } catch (err) {
      console.error('Failed to archive movie:', err);
      setArchiveModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Master Movie Catalog"
        subtitle="Global repository of theatrical releases available for partner multiplexes to schedule across all cities."
        icon={Film}
        badge="Catalog"
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={Plus}>
            Add New Film
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search movie title, genre, or language..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Release Statuses' },
                { value: 'published', label: 'Published & Available' },
                { value: 'archived', label: 'Archived Only' }
              ]}
              wrapperClassName="w-full sm:w-56"
            />
          </div>
        </div>
      </Card>

      {/* Movies Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden p-0">
              <Skeleton className="h-56 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {movies.map((m) => (
            <Card key={m._id} hover className="overflow-hidden flex flex-col p-0 group hover:shadow-xl hover:-translate-y-1 hover:border-[#F84464]/30 transition-all duration-200">
              {/* Poster Frame */}
              <div className="relative aspect-2/3 bg-gray-100 overflow-hidden">
                <img
                  src={m.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'}
                  alt={m.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Rating Badge matching Customer Card */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#222432]/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-xs font-black shadow-md border border-white/10">
                  <Star className="w-3 h-3 text-[#F84464] fill-current" />
                  <span>{m.rating ? m.rating.toFixed(1) : '8.0'}/10</span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant={m.status === 'published' ? 'active' : 'inactive'} size="xs">
                    {m.status === 'published' ? 'Active' : 'Archived'}
                  </Badge>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4 className="font-black text-sm text-[#222432] line-clamp-1 group-hover:text-[#F84464] transition-colors">
                      {m.title}
                    </h4>
                    <CopyButton text={m.title} size="xs" variant="ghost" title="Copy title" />
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    {Array.isArray(m.genre) ? m.genre.join(', ') : m.genre} • {m.certificate}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {m.language} • {m.duration}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400">
                    {m.activeShowsCount || 0} shows
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleOpenEdit(m)}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>

                    {m.status !== 'archived' && (
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => setArchiveModal({ isOpen: true, movie: m, loading: false })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <EmptyState
            icon={Film}
            title="No Movies Found"
            description="No films match your search or filter criteria. Add a new film to expand the platform catalog."
            actionLabel="Add First Film"
            onAction={handleOpenAdd}
            actionIcon={Plus}
          />
        </Card>
      )}

      {/* Add / Edit Movie Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        title={modal.isEdit ? 'Edit Movie Record' : 'Add New Theatrical Release'}
        subtitle="Catalog entries are immediately discoverable by cinema partners for scheduling."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Movie Title"
            placeholder="E.g. Dune: Part Two"
            value={modal.formData.title}
            onChange={(e) =>
              setModal((prev) => ({
                ...prev,
                formData: { ...prev.formData, title: e.target.value }
              }))
            }
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Genre (comma-separated)"
              placeholder="Action, Sci-Fi, Adventure"
              value={modal.formData.genre}
              onChange={(e) =>
                setModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, genre: e.target.value }
                }))
              }
              required
            />

            <Input
              label="Language"
              placeholder="Hindi, English, Telugu"
              value={modal.formData.language}
              onChange={(e) =>
                setModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, language: e.target.value }
                }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Certificate"
              value={modal.formData.certificate}
              onChange={(e) =>
                setModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, certificate: e.target.value }
                }))
              }
              options={[
                { value: 'U', label: 'U' },
                { value: 'UA', label: 'UA' },
                { value: 'UA16+', label: 'UA 16+' },
                { value: 'A', label: 'A (Adult)' }
              ]}
            />

            <Input
              label="Duration"
              placeholder="2h 45m"
              value={modal.formData.duration}
              onChange={(e) =>
                setModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, duration: e.target.value }
                }))
              }
            />

            <Input
              label="Rating (out of 10)"
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={modal.formData.rating}
              onChange={(e) =>
                setModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, rating: e.target.value }
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Poster Image URL"
              placeholder="https://images.unsplash.com/..."
              value={modal.formData.posterUrl}
              onChange={(e) =>
                setModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, posterUrl: e.target.value }
                }))
              }
            />

            <Input
              label="Release Date Display"
              placeholder="15 Oct, 2026"
              value={modal.formData.releaseDate}
              onChange={(e) =>
                setModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, releaseDate: e.target.value }
                }))
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>

            <Button type="submit" variant="primary" loading={modal.submitting}>
              {modal.isEdit ? 'Save Changes' : 'Publish to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Archive Confirmation Modal */}
      <ConfirmModal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal({ isOpen: false, movie: null, loading: false })}
        onConfirm={handleConfirmArchive}
        title="Archive Catalog Movie"
        description={`Are you sure you want to archive "${archiveModal.movie?.title}"? Partners will no longer be able to schedule new shows for this movie.`}
        confirmText="Archive Film"
        variant="destructive"
        loading={archiveModal.loading}
      />
    </div>
  );
}

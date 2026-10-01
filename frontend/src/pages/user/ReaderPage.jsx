import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize,
  Minimize, Sun, Moon, Bookmark, BookmarkCheck, List, X, AlertCircle
} from 'lucide-react';
import { libraryApi, readingProgressApi, bookmarksApi, booksApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ReaderPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [darkMode, setDarkMode] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isCurrentPageBookmarked, setIsCurrentPageBookmarked] = useState(false);
  const iframeRef = useRef(null);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    const loadReader = async () => {
      setLoading(true);
      try {
        const [bookRes, accessRes] = await Promise.all([
          booksApi.getById(bookId),
          libraryApi.getBookAccess(bookId),
        ]);
        setBook(bookRes.data.data);
        const url = accessRes.data.data?.fileUrl;
        if (url) {
          const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';
          setFileUrl(`${base}${url}`);
        }

        // Load reading progress
        const progressRes = await readingProgressApi.get(bookId);
        const progress = progressRes.data.data;
        if (progress?.currentPage) setCurrentPage(progress.currentPage);
        if (progress?.totalPages) setTotalPages(progress.totalPages);

        // Load bookmarks
        const bkRes = await bookmarksApi.get(bookId);
        setBookmarks(bkRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not access this book');
      } finally {
        setLoading(false);
      }
    };
    loadReader();
    return () => { if (progressTimerRef.current) clearTimeout(progressTimerRef.current); };
  }, [bookId]);

  useEffect(() => {
    setIsCurrentPageBookmarked(bookmarks.some(b => b.pageNumber === currentPage));
  }, [currentPage, bookmarks]);

  const saveProgress = useCallback(() => {
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    progressTimerRef.current = setTimeout(() => {
      const pct = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
      readingProgressApi.update(bookId, {
        currentPage,
        totalPages,
        progressPercentage: pct,
        completed: pct >= 99,
      }).catch(console.error);
    }, 2000); // Debounce 2s
  }, [bookId, currentPage, totalPages]);

  useEffect(() => { saveProgress(); }, [currentPage, saveProgress]);

  const goToPage = (p) => {
    const newPage = Math.max(1, Math.min(p, totalPages || 999));
    setCurrentPage(newPage);
  };

  const toggleBookmark = async () => {
    if (isCurrentPageBookmarked) {
      const bk = bookmarks.find(b => b.pageNumber === currentPage);
      if (bk) {
        await bookmarksApi.remove(bk.id);
        setBookmarks(prev => prev.filter(b => b.id !== bk.id));
        toast.success('Bookmark removed');
      }
    } else {
      const res = await bookmarksApi.add(bookId, currentPage, '');
      setBookmarks(prev => [...prev, res.data.data]);
      toast.success(`Page ${currentPage} bookmarked!`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-surface-900 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading your book..." />
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-surface-900 flex flex-col items-center justify-center text-center p-8">
      <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
      <p className="text-gray-400 mb-6">{error}</p>
      <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
    </div>
  );

  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div className={`fixed inset-0 flex flex-col ${darkMode ? 'bg-surface-900' : 'bg-gray-100'}`}>
      {/* ─── TOOLBAR ─── */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${
        darkMode ? 'bg-surface-800 border-white/10' : 'bg-white border-gray-200'
      } z-10`}>
        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn-ghost p-2" title="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0 px-2">
          <p className={`font-display font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {book?.title}
          </p>
          <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {book?.author}
          </p>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1">
          {/* Bookmarks panel toggle */}
          <button onClick={() => setShowBookmarks(!showBookmarks)} className={`btn-ghost p-2 ${showBookmarks ? 'text-primary-400' : ''}`} title="Bookmarks">
            <List className="w-5 h-5" />
          </button>

          {/* Toggle bookmark for current page */}
          <button onClick={toggleBookmark} className={`btn-ghost p-2 ${isCurrentPageBookmarked ? 'text-amber-400' : ''}`} title="Bookmark page">
            {isCurrentPageBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>

          {/* Zoom */}
          <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="btn-ghost p-2" title="Zoom out" disabled={zoom <= 50}>
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className={`text-xs w-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="btn-ghost p-2" title="Zoom in" disabled={zoom >= 200}>
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Theme */}
          <button onClick={() => setDarkMode(!darkMode)} className="btn-ghost p-2" title="Toggle theme">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="btn-ghost p-2 hidden sm:flex" title="Fullscreen">
            {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── CONTENT AREA ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Bookmarks Panel */}
        {showBookmarks && (
          <div className={`w-64 border-r flex flex-col ${darkMode ? 'bg-surface-800 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bookmarks</p>
              <button onClick={() => setShowBookmarks(false)} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {bookmarks.length === 0 ? (
                <p className={`text-sm text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No bookmarks yet</p>
              ) : (
                bookmarks.map(bk => (
                  <button key={bk.id} onClick={() => { goToPage(bk.pageNumber); setShowBookmarks(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      darkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    } ${bk.pageNumber === currentPage ? 'bg-primary-500/10 text-primary-400' : ''}`}>
                    <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Page {bk.pageNumber}
                    {bk.note && <span className="text-xs text-gray-500 truncate">{bk.note}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden relative">
          {fileUrl ? (
            <iframe
              ref={iframeRef}
              src={`${fileUrl}#page=${currentPage}&zoom=${zoom}&toolbar=0`}
              className="w-full h-full border-0"
              title={book?.title}
              style={{ background: darkMode ? '#1a1a2e' : '#f3f4f6' }}
            />
          ) : (
            /* Demo reader when no PDF file uploaded */
            <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className={`max-w-2xl w-full glass-card p-10 text-center`}>
                <div className="text-6xl mb-6">📖</div>
                <h2 className={`text-2xl font-display font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {book?.title}
                </h2>
                <p className={`mb-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>by {book?.author}</p>
                <div className="my-6 divider" />
                <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {book?.description || 'No description available for this book.'}
                </p>
                <div className={`mt-6 p-4 rounded-xl text-sm ${darkMode ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                  📌 Demo Mode: No PDF file is uploaded for this book.<br />
                  Upload a PDF file through the Admin panel to enable full reading.
                </div>
                <p className={`mt-6 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Page {currentPage} of {totalPages || book?.pages || '?'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM CONTROLS ─── */}
      <div className={`flex items-center justify-between px-4 py-3 border-t ${
        darkMode ? 'bg-surface-800 border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Progress bar */}
        <div className="flex-1 mr-4 hidden sm:block">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {progress.toFixed(0)}% complete
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"
            id="prev-page-btn"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={e => goToPage(parseInt(e.target.value) || 1)}
              className={`w-14 text-center text-sm rounded-lg border px-2 py-1 ${
                darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'
              }`}
              id="page-input"
            />
            {totalPages > 0 && <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ {totalPages}</span>}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={totalPages > 0 && currentPage >= totalPages}
            className="btn-primary py-1.5 px-3 text-sm disabled:opacity-40"
            id="next-page-btn"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

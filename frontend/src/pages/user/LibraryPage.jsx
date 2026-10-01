import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Play, Library, Filter } from 'lucide-react';
import { libraryApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

export default function LibraryPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    libraryApi.getMyLibrary()
      .then(res => setBooks(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = books.filter(b => {
    if (activeTab === 'all') return true;
    if (activeTab === 'free') return b.accessType === 'FREE';
    if (activeTab === 'purchased') return b.accessType === 'PAID';
    if (activeTab === 'reading') return b.readingProgress > 0 && b.readingProgress < 100;
    if (activeTab === 'completed') return b.readingProgress >= 100;
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All Books', count: books.length },
    { id: 'reading', label: 'Reading', count: books.filter(b => b.readingProgress > 0 && b.readingProgress < 100).length },
    { id: 'completed', label: 'Completed', count: books.filter(b => b.readingProgress >= 100).length },
    { id: 'purchased', label: 'Purchased', count: books.filter(b => b.accessType === 'PAID').length },
    { id: 'free', label: 'Free', count: books.filter(b => b.accessType === 'FREE').length },
  ];

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" text="Loading your library..." /></div>;

  return (
    <div className="container-custom py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Library className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Library</h1>
          <p className="text-gray-500 text-sm">{books.length} book{books.length !== 1 ? 's' : ''} in your collection</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-primary-500/30 text-primary-300' : 'bg-white/5 text-gray-600'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Library}
          title={activeTab === 'all' ? "Your library is empty" : `No ${activeTab} books`}
          description={activeTab === 'all' ? "Start by browsing our book catalog. Free books are added instantly!" : "Books in this category will appear here."}
          action={{ label: 'Browse Books', onClick: () => navigate('/books') }}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(book => {
            const coverUrl = book.coverUrl ? `${API_BASE}${book.coverUrl}` : null;
            const progress = book.readingProgress || 0;
            return (
              <div key={book.id} className="glass-card-hover p-4 flex gap-4">
                {/* Cover */}
                <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary-900/50 to-surface-700">
                  {coverUrl ? (
                    <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary-400/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-white mb-0.5 line-clamp-1">{book.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                    </div>
                    {book.accessType === 'FREE' ? (
                      <span className="badge-free shrink-0">Free</span>
                    ) : (
                      <span className="badge-paid shrink-0">Purchased</span>
                    )}
                  </div>

                  {/* Progress */}
                  {progress > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{progress >= 100 ? '✓ Completed' : `${Math.round(progress)}% read`}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <button
                    onClick={() => navigate(`/reader/${book.id}`)}
                    className="btn-primary py-1.5 px-4 text-sm"
                    id={`continue-${book.id}`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {progress > 0 && progress < 100 ? 'Continue Reading' : progress >= 100 ? 'Read Again' : 'Start Reading'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

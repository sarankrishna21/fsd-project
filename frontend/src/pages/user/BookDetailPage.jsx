import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, Star, Tag, Calendar, Globe, FileText, ArrowLeft, Check, Plus } from 'lucide-react';
import { booksApi, reviewsApi, libraryApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToLib, setAddingToLib] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const [bookRes, reviewsRes] = await Promise.all([
          booksApi.getById(id),
          reviewsApi.getByBook(id),
        ]);
        setBook(bookRes.data.data);
        setReviews(reviewsRes.data.data || []);
      } catch (err) {
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleReadNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (book.accessType === 'FREE' && !book.inLibrary) {
      try {
        setAddingToLib(true);
        await libraryApi.addToLibrary(id);
        toast.success('Book added to your library!');
      } catch (err) {
        if (!err.response?.data?.message?.includes('already')) {
          console.error(err);
        }
      } finally {
        setAddingToLib(false);
      }
    }
    navigate(`/reader/${id}`);
  };

  const handleAddToLibrary = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      setAddingToLib(true);
      await libraryApi.addToLibrary(id);
      setBook(prev => ({ ...prev, inLibrary: true }));
      toast.success('Added to your library!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to library');
    } finally {
      setAddingToLib(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" text="Loading book details..." /></div>;
  if (error) return <div className="container-custom py-16"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!book) return null;

  const isFree = book.accessType === 'FREE';
  const inCart = isInCart(book.id);
  const coverUrl = book.coverUrl ? `${API_BASE}${book.coverUrl}` : null;

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Books
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Cover + Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Cover */}
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-900/50 to-surface-700 border border-white/10 shadow-2xl">
              {coverUrl ? (
                <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <BookOpen className="w-20 h-20 text-primary-400/50" />
                  <p className="text-gray-500 text-sm px-4 text-center">{book.title}</p>
                </div>
              )}
            </div>

            {/* Price & Badge */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                {isFree ? (
                  <span className="text-2xl font-display font-bold text-emerald-400">FREE</span>
                ) : (
                  <span className="text-2xl font-display font-bold text-white">₹{book.price}</span>
                )}
                {isFree ? <span className="badge-free">Free Access</span> : <span className="badge-paid">Premium</span>}
              </div>

              {/* CTA Buttons */}
              {isFree ? (
                <div className="space-y-2">
                  <button onClick={handleReadNow} disabled={addingToLib} className="w-full btn-primary py-3" id="read-now-btn">
                    <BookOpen className="w-4 h-4" />
                    {book.inLibrary ? 'Continue Reading' : 'Read Now — Free'}
                  </button>
                  {!book.inLibrary && (
                    <button onClick={handleAddToLibrary} disabled={addingToLib} className="w-full btn-secondary py-3 text-sm" id="add-to-library-btn">
                      <Plus className="w-4 h-4" /> Add to My Library
                    </button>
                  )}
                </div>
              ) : book.inLibrary ? (
                <button onClick={() => navigate(`/reader/${id}`)} className="w-full btn-primary py-3" id="continue-reading-btn">
                  <BookOpen className="w-4 h-4" /> Continue Reading
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => isAuthenticated ? addToCart(book) : navigate('/login')}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      inCart ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'btn-primary'
                    }`}
                    id="add-to-cart-btn"
                  >
                    {inCart ? <><Check className="w-4 h-4" /> In Cart</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
                  </button>
                  {inCart && (
                    <Link to="/checkout" className="w-full btn-secondary py-3 text-sm flex items-center justify-center gap-2" id="buy-now-btn">
                      Buy Now — ₹{book.price}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Meta */}
          <div>
            {book.categoryName && (
              <Link to={`/books?categoryId=${book.categoryId}`} className="inline-flex items-center gap-1.5 text-primary-400 text-sm font-medium mb-3 hover:text-primary-300 transition-colors">
                <Tag className="w-3.5 h-3.5" /> {book.categoryName}
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 leading-tight">{book.title}</h1>
            <p className="text-xl text-gray-400 mb-4">by <span className="text-primary-400">{book.author}</span></p>

            {/* Rating */}
            {book.totalRatings > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(book.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                  ))}
                </div>
                <span className="text-white font-semibold">{book.averageRating?.toFixed(1)}</span>
                <span className="text-gray-500">({book.totalRatings} reviews)</span>
                {book.purchaseCount > 0 && <span className="text-gray-500">• {book.purchaseCount} readers</span>}
              </div>
            )}
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h2 className="text-xl font-display font-semibold text-white mb-3">About this book</h2>
              <p className="text-gray-400 leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-display font-semibold text-white mb-4">Book Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Publisher', value: book.publisher, icon: FileText },
                { label: 'Language', value: book.language, icon: Globe },
                { label: 'Pages', value: book.pages, icon: FileText },
                { label: 'ISBN', value: book.isbn, icon: FileText },
                { label: 'Published', value: book.publicationDate, icon: Calendar },
                { label: 'Category', value: book.categoryName, icon: Tag },
              ].filter(d => d.value).map(detail => {
                const Icon = detail.icon;
                return (
                  <div key={detail.label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">{detail.label}</p>
                      <p className="text-sm text-white">{detail.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {book.tags && (
            <div className="flex flex-wrap gap-2">
              {book.tags.split(',').map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-xs border border-white/10 hover:border-primary-500/30 transition-colors cursor-pointer">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-display font-semibold text-white mb-4">Reader Reviews</h2>
              <div className="space-y-4">
                {reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {review.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{review.user?.name || 'Reader'}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-gray-400 text-sm">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

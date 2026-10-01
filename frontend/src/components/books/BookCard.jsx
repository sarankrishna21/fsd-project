import { Star, BookOpen, ShoppingCart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

export function BookCard({ book, compact = false }) {
  const { addToCart, isInCart } = useCart();
  const isFree = book.accessType === 'FREE';
  const inCart = isInCart(book.id);
  const coverUrl = book.coverUrl ? `${API_BASE}${book.coverUrl}` : null;

  return (
    <div className="book-card group animate-fade-in" id={`book-card-${book.id}`}>
      <Link to={`/books/${book.id}`}>
        {/* Cover */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary-900/50 to-surface-700">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
              <BookOpen className="w-12 h-12 text-primary-400/50" />
              <p className="text-xs text-center text-gray-500 line-clamp-2">{book.title}</p>
            </div>
          )}
          {/* Badge overlay */}
          <div className="absolute top-3 left-3">
            {isFree ? (
              <span className="badge-free">Free</span>
            ) : (
              <span className="badge-paid">₹{book.price}</span>
            )}
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Info */}
      <div className={`p-${compact ? '3' : '4'}`}>
        <Link to={`/books/${book.id}`}>
          <h3 className="font-display font-semibold text-white text-sm line-clamp-2 mb-1 hover:text-primary-400 transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-xs mb-2 truncate">{book.author}</p>

        {/* Rating */}
        {book.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-amber-400 font-medium">{book.averageRating?.toFixed(1)}</span>
            <span className="text-xs text-gray-600">({book.totalRatings})</span>
          </div>
        )}

        {/* Category */}
        {book.categoryName && (
          <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-500 mb-3">
            {book.categoryName}
          </span>
        )}

        {/* Action */}
        {!compact && (
          isFree ? (
            <Link to={`/books/${book.id}`} className="w-full btn-primary py-2 text-xs" id={`read-btn-${book.id}`}>
              <BookOpen className="w-3.5 h-3.5" /> Read Free
            </Link>
          ) : (
            <button
              onClick={(e) => { e.preventDefault(); addToCart(book); }}
              className={`w-full py-2 text-xs rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                inCart
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'btn-secondary'
              }`}
              id={`cart-btn-${book.id}`}
            >
              {inCart ? (
                <><Check className="w-3.5 h-3.5" /> In Cart</>
              ) : (
                <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
              )}
            </button>
          )
        )}
      </div>

      {/* Reading progress bar */}
      {book.readingProgress != null && (
        <div className="px-4 pb-3">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${book.readingProgress}%` }} />
          </div>
          <p className="text-xs text-gray-600 mt-1">{Math.round(book.readingProgress)}% read</p>
        </div>
      )}
    </div>
  );
}

export function BookSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5">
      <div className="skeleton aspect-[3/4]" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="skeleton h-8 rounded-xl mt-3" />
      </div>
    </div>
  );
}

export function BooksGrid({ books, loading, skeletonCount = 8, compact = false }) {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${compact ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 md:gap-6`}>
        {Array.from({ length: skeletonCount }).map((_, i) => <BookSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${compact ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 md:gap-6`}>
      {books.map(book => <BookCard key={book.id} book={book} compact={compact} />)}
    </div>
  );
}

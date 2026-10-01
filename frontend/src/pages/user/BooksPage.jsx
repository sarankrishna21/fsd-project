import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { booksApi, categoriesApi } from '../../api';
import { BooksGrid } from '../../components/books/BookCard';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('query') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const accessType = searchParams.get('accessType') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '0');

  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    categoriesApi.getAll().then(res => setCategories(res.data.data || []));
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 12, sortBy };
      if (query) params.query = query;
      if (categoryId) params.categoryId = categoryId;
      if (accessType) params.accessType = accessType;

      const res = await booksApi.getAll(params);
      const data = res.data.data;
      setBooks(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      console.error('Failed to load books', err);
    } finally {
      setLoading(false);
    }
  }, [query, categoryId, accessType, sortBy, page]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('query', localQuery.trim());
  };

  const clearFilters = () => {
    setLocalQuery('');
    setSearchParams({});
  };

  const hasFilters = query || categoryId || accessType;

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          {query ? `Results for "${query}"` : categoryId ? 'Books by Category' : accessType === 'FREE' ? 'Free Books' : 'All Books'}
        </h1>
        {!loading && <p className="text-gray-500">{totalElements} book{totalElements !== 1 ? 's' : ''} found</p>}
      </div>

      {/* Search + Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              placeholder="Search books, authors..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
              id="books-search-input"
            />
            {localQuery && (
              <button type="button" onClick={() => { setLocalQuery(''); updateParam('query', ''); }}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary px-4 py-2 text-sm" id="books-search-btn">Search</button>
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 text-sm ${showFilters ? 'border-primary-500/50 text-primary-400' : ''}`}
          id="filter-btn"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-5 h-5 bg-primary-500 rounded-full text-xs flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-card p-5 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="form-label">Category</label>
              <select
                value={categoryId}
                onChange={e => updateParam('categoryId', e.target.value)}
                className="select-field text-sm"
                id="category-filter"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Access Type */}
            <div>
              <label className="form-label">Access Type</label>
              <select
                value={accessType}
                onChange={e => updateParam('accessType', e.target.value)}
                className="select-field text-sm"
                id="access-type-filter"
              >
                <option value="">All Books</option>
                <option value="FREE">Free Books</option>
                <option value="PAID">Paid Books</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="form-label">Sort By</label>
              <select
                value={sortBy}
                onChange={e => updateParam('sortBy', e.target.value)}
                className="select-field text-sm"
                id="sort-filter"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title_asc">Title A-Z</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Books Grid */}
      {!loading && books.length === 0 ? (
        <EmptyState
          title="No books found"
          description={query ? `No results for "${query}". Try different keywords.` : 'No books match your current filters.'}
          action={hasFilters ? { label: 'Clear filters', onClick: clearFilters } : undefined}
        />
      ) : (
        <>
          <BooksGrid books={books} loading={loading} />
          <Pagination page={page} totalPages={totalPages} onPageChange={p => updateParam('page', p.toString())} />
        </>
      )}
    </div>
  );
}

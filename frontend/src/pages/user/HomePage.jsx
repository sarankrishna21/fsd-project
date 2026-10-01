import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Sparkles, ArrowRight, Star, Zap, Shield, ChevronRight } from 'lucide-react';
import { booksApi, categoriesApi } from '../../api';
import { BooksGrid } from '../../components/books/BookCard';

const CATEGORIES_ICONS = {
  'Programming': '💻', 'Technology': '🔧', 'Science': '🔬', 'Fiction': '📖',
  'Business': '💼', 'Self Development': '🌱', 'Education': '🎓',
  'History': '🏛️', 'Mystery': '🕵️', 'Romance': '❤️',
};

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [freeBooks, setFreeBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [feat, pop, free, cats] = await Promise.all([
          booksApi.getFeatured(),
          booksApi.getPopular(),
          booksApi.getAll({ accessType: 'FREE', size: 4 }),
          categoriesApi.getAll(),
        ]);
        setFeaturedBooks(feat.data.data?.slice(0, 8) || []);
        setPopularBooks(pop.data.data?.slice(0, 4) || []);
        setFreeBooks(free.data.data?.content || []);
        setCategories(cats.data.data || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/books?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container-custom text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Your Digital Reading Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight animate-slide-up">
            Discover Your{' '}
            <span className="gradient-text">Next Great Read</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Explore thousands of books across every genre. Read free books instantly or purchase premium titles and dive into unlimited knowledge.
          </p>

          {/* Hero CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/books" className="btn-primary px-8 py-4 text-lg" id="hero-explore-btn">
              <BookOpen className="w-5 h-5" /> Explore Books
            </Link>
            <Link to="/books?accessType=FREE" className="btn-secondary px-8 py-4 text-lg" id="hero-free-btn">
              <Zap className="w-5 h-5" /> Free Books
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '10K+', label: 'Books Available' },
              { value: '50K+', label: 'Happy Readers' },
              { value: '500+', label: 'Free Books' },
              { value: '4.8★', label: 'Average Rating' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-display font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEARCH ─── */}
      <section className="container-custom -mt-8 mb-16">
        <form onSubmit={handleSearch} className="glass-card p-3 flex gap-3 max-w-3xl mx-auto">
          <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search books, authors, categories..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-base"
              id="hero-search-input"
            />
          </div>
          <button type="submit" className="btn-primary px-6 shrink-0" id="hero-search-btn">Search</button>
        </form>
      </section>

      {/* ─── FEATURED BOOKS ─── */}
      <section className="container-custom mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Recently Added</h2>
            <p className="text-gray-500 mt-1">Fresh titles just added to our library</p>
          </div>
          <Link to="/books" className="btn-ghost text-primary-400 hover:text-primary-300">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <BooksGrid books={featuredBooks} loading={loading} skeletonCount={8} />
      </section>

      {/* ─── FREE BOOKS ─── */}
      <section className="relative py-16 mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-teal-900/20" />
        <div className="relative container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-free text-sm">Free</span>
              </div>
              <h2 className="section-title">Read for Free</h2>
              <p className="text-gray-400 mt-1">Start reading instantly — no payment required</p>
            </div>
            <Link to="/books?accessType=FREE" className="btn-ghost text-emerald-400">
              All free books <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <BooksGrid books={freeBooks} loading={loading} skeletonCount={4} />
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="container-custom mb-16">
        <div className="text-center mb-10">
          <h2 className="section-title">Browse by Category</h2>
          <p className="text-gray-500 mt-2">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {(loading ? Array(10).fill(null) : categories).map((cat, i) => (
            cat ? (
              <Link
                key={cat.id}
                to={`/books?categoryId=${cat.id}`}
                className="glass-card-hover p-5 text-center group"
                id={`category-${cat.id}`}
              >
                <div className="text-3xl mb-3">{CATEGORIES_ICONS[cat.name] || '📚'}</div>
                <p className="font-medium text-white text-sm group-hover:text-primary-400 transition-colors">{cat.name}</p>
              </Link>
            ) : (
              <div key={i} className="skeleton rounded-2xl h-24" />
            )
          ))}
        </div>
      </section>

      {/* ─── POPULAR BOOKS ─── */}
      <section className="container-custom mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Most Popular</h2>
            <p className="text-gray-500 mt-1">Books loved by our community</p>
          </div>
          <Link to="/books?sortBy=popular" className="btn-ghost text-primary-400">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <BooksGrid books={popularBooks} loading={loading} skeletonCount={4} />
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/10 to-transparent" />
        <div className="relative container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="text-gray-400 mt-2">Start reading in just a few steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Discover', desc: 'Browse thousands of books across all genres and categories', icon: Search },
              { step: '02', title: 'Choose', desc: 'Pick free books or purchase premium titles you love', icon: Star },
              { step: '03', title: 'Read', desc: 'Enjoy seamless reading in our beautiful online reader', icon: BookOpen },
              { step: '04', title: 'Continue', desc: 'Your progress is saved — resume anytime, anywhere', icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="glass-card p-6 text-center group hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-4xl font-display font-bold text-primary-500/20 mb-3">{item.step}</div>
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="container-custom mb-20">
        <div className="relative glass-card overflow-hidden p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to start reading?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join thousands of readers today. Create your free account and start exploring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary px-8 py-3" id="cta-signup-btn">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/books" className="btn-secondary px-8 py-3">Browse Books</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen, Eye, Search } from 'lucide-react';
import { booksApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = { page, size: 15, sortBy: 'newest' };
      if (search) params.query = search;
      const res = await booksApi.getAll(params);
      const data = res.data.data;
      setBooks(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, [page, search]);

  const handleDelete = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"? This will hide it from users.`)) return;
    setDeleting(book.id);
    try {
      await booksApi.delete(book.id);
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (err) {
      toast.error('Failed to delete book');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Books Management</h1>
          <p className="text-gray-500 text-sm">Manage your library catalog</p>
        </div>
        <Link to="/admin/books/new" className="btn-primary" id="add-book-btn">
          <Plus className="w-4 h-4" /> Add Book
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 max-w-sm">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search books..." className="bg-transparent text-white placeholder-gray-500 outline-none text-sm flex-1" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : books.length === 0 ? (
        <EmptyState icon={BookOpen} title="No books found"
          action={{ label: 'Add First Book', onClick: () => navigate('/admin/books/new') }} />
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Category</th>
                    <th>Access</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => {
                    const coverUrl = book.coverUrl ? `${API_BASE}${book.coverUrl}` : null;
                    return (
                      <tr key={book.id} className="hover:bg-white/3 transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-lg overflow-hidden bg-surface-700 shrink-0">
                              {coverUrl ? (
                                <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                              ) : <BookOpen className="w-5 h-5 text-gray-600 m-auto mt-3" />}
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm line-clamp-1">{book.title}</p>
                              <p className="text-xs text-gray-500">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="text-xs text-gray-400">{book.categoryName || '-'}</span></td>
                        <td>
                          {book.accessType === 'FREE' ? (
                            <span className="badge-free">Free</span>
                          ) : (
                            <span className="badge-paid">Paid</span>
                          )}
                        </td>
                        <td className="text-sm">{book.accessType === 'FREE' ? '—' : `₹${book.price}`}</td>
                        <td className="text-sm text-amber-400">{book.averageRating > 0 ? `★ ${book.averageRating?.toFixed(1)}` : '—'}</td>
                        <td>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            book.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                            book.status === 'DELETED' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>{book.status}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Link to={`/books/${book.id}`} className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors" title="View">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link to={`/admin/books/${book.id}/edit`} className="p-1.5 text-gray-500 hover:text-primary-400 rounded-lg hover:bg-white/5 transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(book)} disabled={deleting === book.id}
                              className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors" title="Delete">
                              {deleting === book.id ? (
                                <div className="w-4 h-4 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                              ) : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

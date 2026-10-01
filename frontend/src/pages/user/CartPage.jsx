import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/common/EmptyState';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

export default function CartPage() {
  const { items, removeFromCart, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container-custom py-8 max-w-4xl">
      <h1 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
        <ShoppingCart className="w-6 h-6 text-primary-400" />
        Shopping Cart
        {items.length > 0 && <span className="text-sm font-normal text-gray-500">({items.length} item{items.length > 1 ? 's' : ''})</span>}
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add some books to get started!"
          action={{ label: 'Browse Books', onClick: () => navigate('/books') }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(book => {
              const coverUrl = book.coverUrl ? `${API_BASE}${book.coverUrl}` : null;
              return (
                <div key={book.id} className="glass-card p-4 flex gap-4 animate-fade-in">
                  <div className="w-14 h-18 rounded-lg overflow-hidden shrink-0 bg-surface-700">
                    {coverUrl ? (
                      <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-0.5 line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                    <p className="text-primary-400 font-bold">₹{book.price}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(book.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors h-fit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="font-display font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map(book => (
                  <div key={book.id} className="flex justify-between text-sm">
                    <span className="text-gray-400 truncate mr-2 flex-1">{book.title}</span>
                    <span className="text-white shrink-0">₹{book.price}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-primary-400 text-lg">₹{total.toFixed(0)}</span>
                </div>
              </div>
              <button
                onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/login')}
                className="w-full btn-primary py-3"
                id="checkout-btn"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/books" className="w-full btn-ghost text-sm mt-2 justify-center">Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, BookOpen, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ordersApi } from '../../api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('demo');

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1: Create order
      const bookIds = items.map(i => i.id);
      const orderRes = await ordersApi.create(bookIds);
      const order = orderRes.data.data;

      // Step 2: Demo payment confirmation
      const paymentId = `demo_pay_${Date.now()}`;
      await ordersApi.confirmPayment(order.id, paymentId);

      // Success
      clearCart();
      setSuccess(true);
      toast.success('🎉 Payment successful! Books added to your library.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container-custom py-16 max-w-md mx-auto text-center animate-scale-in">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white mb-3">Payment Successful!</h1>
        <p className="text-gray-400 mb-8">Your books have been added to your library. Start reading now!</p>
        <div className="space-y-3">
          <button onClick={() => navigate('/library')} className="w-full btn-primary py-3">
            <BookOpen className="w-4 h-4" /> Go to My Library
          </button>
          <button onClick={() => navigate('/books')} className="w-full btn-secondary py-3">Browse More Books</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      <h1 className="text-2xl font-display font-bold text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-white">Order Summary</h2>
          {items.map(book => (
            <div key={book.id} className="glass-card p-3 flex gap-3">
              <div className="w-12 h-14 rounded-lg bg-surface-700 overflow-hidden shrink-0">
                {book.coverUrl ? (
                  <img src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${book.coverUrl}`}
                    alt={book.title} className="w-full h-full object-cover" />
                ) : <div className="w-full h-full flex items-center justify-center text-xl">📖</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white line-clamp-1">{book.title}</p>
                <p className="text-xs text-gray-500">{book.author}</p>
              </div>
              <span className="text-primary-400 font-bold text-sm shrink-0">₹{book.price}</span>
            </div>
          ))}
          <div className="glass-card p-4 flex justify-between font-bold">
            <span className="text-white">Total Amount</span>
            <span className="text-primary-400 text-xl">₹{total.toFixed(0)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-white">Payment Method</h2>

          <div className="space-y-3">
            {[
              { id: 'demo', label: 'Demo Payment (Test Mode)', icon: Zap, desc: 'Instant payment — for academic demo' },
            ].map(m => (
              <label key={m.id} className={`glass-card p-4 flex items-center gap-3 cursor-pointer border transition-all ${
                paymentMethod === m.id ? 'border-primary-500/50 bg-primary-500/5' : 'border-white/10'
              }`}>
                <input type="radio" value={m.id} checked={paymentMethod === m.id}
                  onChange={() => setPaymentMethod(m.id)} className="accent-primary-500" />
                <m.icon className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-sm font-medium text-white">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Demo Payment Info */}
          <div className="glass-card p-4 border border-amber-500/20 bg-amber-500/5">
            <p className="text-amber-400 text-xs font-medium mb-1">🧪 Demo Mode</p>
            <p className="text-gray-400 text-xs">This is a test payment flow. No real money is charged. Click "Pay Now" to complete the demo purchase.</p>
          </div>

          <div className="glass-card p-4 flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Your transaction is secured and encrypted</span>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full btn-primary py-4 text-base"
            id="pay-now-btn"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Payment...
              </div>
            ) : (
              <><CreditCard className="w-5 h-5" /> Pay ₹{total.toFixed(0)}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

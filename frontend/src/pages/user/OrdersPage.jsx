import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ordersApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

const StatusBadge = ({ status }) => {
  const styles = {
    PAID: 'bg-emerald-500/20 text-emerald-400',
    PENDING: 'bg-amber-500/20 text-amber-400',
    FAILED: 'bg-red-500/20 text-red-400',
    REFUNDED: 'bg-blue-500/20 text-blue-400',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getMyOrders({ page: 0, size: 20 })
      .then(res => setOrders(res.data.data?.content || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="container-custom py-8 max-w-4xl">
      <h1 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 text-primary-400" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Your purchase history will appear here." />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-display font-semibold text-white">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-400 text-lg">₹{order.totalAmount}</p>
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </div>

              {/* Books */}
              <div className="space-y-2">
                {order.items?.map(item => {
                  const coverUrl = item.coverUrl ? `${API_BASE}${item.coverUrl}` : null;
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-t border-white/5">
                      <div className="w-8 h-10 rounded-lg bg-surface-700 overflow-hidden shrink-0">
                        {coverUrl && <img src={coverUrl} alt={item.bookTitle} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{item.bookTitle}</p>
                      </div>
                      <span className="text-sm text-gray-400">₹{item.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

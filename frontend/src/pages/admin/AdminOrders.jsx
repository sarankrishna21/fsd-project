import { useState, useEffect } from 'react';
import { ShoppingBag, Clock } from 'lucide-react';
import { adminApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const StatusBadge = ({ status }) => {
  const styles = {
    PAID: 'bg-emerald-500/20 text-emerald-400',
    PENDING: 'bg-amber-500/20 text-amber-400',
    FAILED: 'bg-red-500/20 text-red-400',
    REFUNDED: 'bg-blue-500/20 text-blue-400',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({ page, size: 15 });
      setOrders(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page]);

  if (loading && orders.length === 0) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Orders</h1>
        <p className="text-gray-500 text-sm">View purchase history across the platform</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders found" />
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>User</th>
                    <th>Books</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-white/3 transition-colors">
                      <td className="font-medium text-white text-sm">{order.orderNumber}</td>
                      <td>
                        <p className="text-sm text-white">{order.userName}</p>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 max-w-xs">
                          {order.items?.map(item => (
                            <span key={item.id} className="text-xs text-gray-400 truncate bg-white/5 px-2 py-0.5 rounded">
                              {item.bookTitle}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="font-bold text-primary-400 text-sm">₹{order.totalAmount}</td>
                      <td><StatusBadge status={order.paymentStatus} /></td>
                      <td className="text-sm text-gray-400">
                        <Clock className="w-3 h-3 inline mr-1 mb-0.5" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
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

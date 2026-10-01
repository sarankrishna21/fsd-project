import { useState, useEffect } from 'react';
import { BookOpen, Users, ShoppingBag, TrendingUp, DollarSign, Star, BarChart2 } from 'lucide-react';
import { adminApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="glass-card p-6 flex items-center gap-4 hover:border-primary-500/20 transition-colors">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
      {subtext && <p className="text-xs text-gray-600 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to the Library Store admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Total Books" value={stats?.totalBooks ?? 0} color="bg-primary-600" subtext={`${stats?.freeBooks ?? 0} free, ${stats?.paidBooks ?? 0} paid`} />
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} color="bg-purple-600" subtext={`${stats?.activeUsers ?? 0} active`} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders ?? 0} color="bg-emerald-600" subtext="Successful payments" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} color="bg-amber-600" subtext="From paid books" />
        <StatCard icon={Star} label="Free Books" value={stats?.freeBooks ?? 0} color="bg-teal-600" subtext="Available at no cost" />
        <StatCard icon={TrendingUp} label="Paid Books" value={stats?.paidBooks ?? 0} color="bg-pink-600" subtext="Premium catalog" />
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Book', href: '/admin/books/new', color: 'from-primary-600 to-purple-600' },
            { label: 'Manage Books', href: '/admin/books', color: 'from-emerald-600 to-teal-600' },
            { label: 'View Users', href: '/admin/users', color: 'from-amber-600 to-orange-600' },
            { label: 'View Orders', href: '/admin/orders', color: 'from-pink-600 to-rose-600' },
          ].map(action => (
            <a key={action.label} href={action.href}
              className={`bg-gradient-to-br ${action.color} p-4 rounded-xl text-center text-white font-medium text-sm hover:opacity-90 transition-opacity`}>
              {action.label}
            </a>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-white mb-4">Books Distribution</h2>
          {stats && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Free Books</span>
                  <span className="text-emerald-400">{stats.freeBooks} ({stats.totalBooks > 0 ? Math.round(stats.freeBooks / stats.totalBooks * 100) : 0}%)</span>
                </div>
                <div className="progress-bar"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${stats.totalBooks > 0 ? (stats.freeBooks / stats.totalBooks) * 100 : 0}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Paid Books</span>
                  <span className="text-amber-400">{stats.paidBooks} ({stats.totalBooks > 0 ? Math.round(stats.paidBooks / stats.totalBooks * 100) : 0}%)</span>
                </div>
                <div className="progress-bar"><div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${stats.totalBooks > 0 ? (stats.paidBooks / stats.totalBooks) * 100 : 0}%` }} /></div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-white mb-4">Platform Summary</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Total Library Collection', value: stats?.totalBooks },
              { label: 'Registered Users', value: stats?.totalUsers },
              { label: 'Completed Purchases', value: stats?.totalOrders },
              { label: 'Revenue Generated', value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}` },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-semibold text-white">{item.value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

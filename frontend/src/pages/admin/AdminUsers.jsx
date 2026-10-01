import { useState, useEffect } from 'react';
import { Users, Shield, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page, size: 15 });
      setUsers(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    setUpdating(userId);
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      toast.success(`User successfully ${action}d`);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setUpdating(null);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    const action = newRole === 'ROLE_ADMIN' ? 'promote to Admin' : 'demote to User';
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    setUpdating(userId);
    try {
      await adminApi.updateUserRole(userId, newRole);
      toast.success(`User role updated successfully`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  if (loading && users.length === 0) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Users</h1>
        <p className="text-gray-500 text-sm">Manage registered accounts</p>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/3 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-white text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-400">{user.email}</td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          user.role === 'ROLE_ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-primary-500/20 text-primary-400'
                        }`}>
                          {user.role === 'ROLE_ADMIN' ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          user.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {user.status}
                        </span>
                      </td>
                      <td className="text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRoleChange(user.id, user.role)}
                            disabled={updating === user.id}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              user.role === 'ROLE_ADMIN' ? 'text-amber-400 hover:bg-amber-400/10' : 'text-primary-400 hover:bg-primary-400/10'
                            }`}
                          >
                            {user.role === 'ROLE_ADMIN' ? 'Demote' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.id, user.status)}
                            disabled={updating === user.id}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              user.status === 'ACTIVE' ? 'text-red-400 hover:bg-red-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'
                            }`}
                          >
                            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
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

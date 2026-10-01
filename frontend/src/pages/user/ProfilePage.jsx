import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api';
import { User, Mail, Lock, LogOut, Shield, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setSavingProfile(true);
    try {
      const res = await usersApi.updateMe({ name });
      updateUser(res.data.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPassword(true);
    try {
      await usersApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{user?.name}</h1>
          <p className="text-gray-500">{user?.email}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${user?.role === 'ROLE_ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-primary-500/20 text-primary-400'}`}>
            {user?.role === 'ROLE_ADMIN' ? '👑 Admin' : '👤 Reader'}
          </span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="glass-card p-6 mb-6">
        <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2"><User className="w-4 h-4 text-primary-400" /> Profile Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" id="profile-name" />
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input type="email" value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6 mb-6">
        <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2"><Lock className="w-4 h-4 text-primary-400" /> Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword', id: 'cur-pwd' },
            { label: 'New Password', key: 'newPassword', id: 'new-pwd' },
            { label: 'Confirm New Password', key: 'confirmPassword', id: 'conf-pwd' },
          ].map(field => (
            <div key={field.key}>
              <label className="form-label">{field.label}</label>
              <input type="password" value={passwordForm[field.key]}
                onChange={e => setPasswordForm(f => ({ ...f, [field.key]: e.target.value }))}
                className="input-field" id={field.id} />
            </div>
          ))}
          <button type="submit" disabled={savingPassword} className="btn-primary" id="change-password-btn">
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="glass-card p-6 mb-6">
        <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-400" /> Account Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Account Status</span><span className="text-emerald-400">Active</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="text-white">{user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Reader'}</span></div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout} className="w-full btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/5 py-3" id="logout-btn">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
}

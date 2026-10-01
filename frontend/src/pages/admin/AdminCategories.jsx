import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { categoriesApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setForm({ name: category.name, description: category.description || '', icon: category.icon || '' });
    } else {
      setEditingCategory(null);
      setForm({ name: '', description: '', icon: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    
    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, form);
        toast.success('Category updated successfully');
      } else {
        await categoriesApi.create(form);
        toast.success('Category created successfully');
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) return;
    setDeleting(category.id);
    try {
      await categoriesApi.delete(category.id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Categories</h1>
          <p className="text-gray-500 text-sm">Manage book categories and genres</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary" id="add-category-btn">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={Tag} title="No categories found" action={{ label: 'Add Category', onClick: () => handleOpenModal() }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="glass-card p-5 group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                  {cat.icon || '📚'}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(cat)} className="p-1.5 text-gray-500 hover:text-primary-400 rounded-lg hover:bg-white/5 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat)} disabled={deleting === cat.id} className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors">
                    {deleting === cat.id ? <div className="w-4 h-4 border border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <h3 className="font-display font-semibold text-white mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-500 flex-1">{cat.description || 'No description provided.'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md glass-card bg-surface-900 border border-white/10 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-display font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Category Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field" placeholder="e.g. Science Fiction" required />
              </div>
              <div>
                <label className="form-label">Icon (Emoji or text)</label>
                <input type="text" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  className="input-field" placeholder="e.g. 🚀" />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-field resize-none" rows={3} placeholder="Brief description of the category..." />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 py-2">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2" id="save-category-btn">
                  {submitting ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

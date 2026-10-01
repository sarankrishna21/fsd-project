import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, BookOpen, Save } from 'lucide-react';
import { booksApi, categoriesApi } from '../../api';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

const INITIAL = {
  title: '', author: '', description: '', isbn: '',
  publisher: '', language: 'English', pages: '',
  publicationDate: '', accessType: 'FREE', price: '0',
  categoryId: '', tags: '', status: 'ACTIVE',
};

export default function AdminBookForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [categories, setCategories] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const coverRef = useRef();
  const fileRef = useRef();

  useEffect(() => {
    categoriesApi.getAll().then(res => setCategories(res.data.data || []));
    if (isEdit) {
      booksApi.getById(id)
        .then(res => {
          const b = res.data.data;
          setForm({
            title: b.title || '', author: b.author || '', description: b.description || '',
            isbn: b.isbn || '', publisher: b.publisher || '', language: b.language || 'English',
            pages: b.pages || '', publicationDate: b.publicationDate || '',
            accessType: b.accessType || 'FREE', price: b.price || '0',
            categoryId: b.categoryId || '', tags: b.tags || '', status: b.status || 'ACTIVE',
          });
          if (b.coverUrl) setCoverPreview(`${API_BASE}${b.coverUrl}`);
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) { toast.error('Title and author are required'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('book', JSON.stringify({
        ...form,
        pages: form.pages ? parseInt(form.pages) : null,
        price: form.accessType === 'FREE' ? 0 : parseFloat(form.price),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      }));
      if (coverFile) fd.append('cover', coverFile);
      if (bookFile) fd.append('file', bookFile);

      if (isEdit) {
        await booksApi.update(id, fd);
        toast.success('Book updated successfully!');
      } else {
        await booksApi.create(fd);
        toast.success('Book created successfully!');
      }
      navigate('/admin/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const InputField = ({ label, name, type = 'text', required = false, ...props }) => (
    <div>
      <label className="form-label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <input type={type} name={name} value={form[name]} onChange={handleChange}
        className="input-field" required={required} {...props} />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/books')} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{isEdit ? 'Edit Book' : 'Add New Book'}</h1>
          <p className="text-gray-500 text-sm">Fill in the book details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Cover + File */}
          <div className="space-y-4">
            {/* Cover Upload */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">Book Cover</h3>
              <div
                onClick={() => coverRef.current?.click()}
                className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-white/10 hover:border-primary-500/50 cursor-pointer transition-all bg-surface-700 flex items-center justify-center relative group"
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload cover</p>
                    <p className="text-xs text-gray-600">JPG, PNG, WebP</p>
                  </div>
                )}
              </div>
              <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              {coverFile && <p className="text-xs text-gray-500 mt-2 truncate">{coverFile.name}</p>}
            </div>

            {/* PDF Upload */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">Book PDF File</h3>
              <div
                onClick={() => fileRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-primary-500/50 cursor-pointer transition-all text-center"
              >
                <BookOpen className="w-7 h-7 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{bookFile ? bookFile.name : 'Upload PDF file'}</p>
                <p className="text-xs text-gray-600">PDF format only</p>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.epub" onChange={e => setBookFile(e.target.files[0])} className="hidden" />
            </div>
          </div>

          {/* Right: Form fields */}
          <div className="lg:col-span-2 glass-card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Title" name="title" required placeholder="Book title" />
              <InputField label="Author" name="author" required placeholder="Author name" />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={4} placeholder="Book description..."
                className="input-field resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Category</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange} className="select-field">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="select-field">
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="DELETED">Deleted</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Access Type</label>
                <select name="accessType" value={form.accessType} onChange={handleChange} className="select-field">
                  <option value="FREE">Free</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
              {form.accessType === 'PAID' && (
                <InputField label="Price (₹)" name="price" type="number" placeholder="0.00" />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="ISBN" name="isbn" placeholder="978-..." />
              <InputField label="Publisher" name="publisher" placeholder="Publisher" />
              <InputField label="Language" name="language" placeholder="English" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Pages" name="pages" type="number" placeholder="0" />
              <InputField label="Publication Date" name="publicationDate" type="date" />
            </div>

            <InputField label="Tags" name="tags" placeholder="comma,separated,tags" />

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary px-8" id="save-book-btn">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <><Save className="w-4 h-4" /> {isEdit ? 'Update Book' : 'Create Book'}</>}
              </button>
              <button type="button" onClick={() => navigate('/admin/books')} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

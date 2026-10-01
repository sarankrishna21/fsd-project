import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg border border-white/10 hover:border-primary-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {start > 0 && (
        <>
          <button onClick={() => onPageChange(0)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-white/5 transition-colors">1</button>
          {start > 1 && <span className="text-gray-500">...</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            p === page
              ? 'bg-primary-600 text-white font-semibold'
              : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          {p + 1}
        </button>
      ))}

      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="text-gray-500">...</span>}
          <button onClick={() => onPageChange(totalPages - 1)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-white/5 transition-colors">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="p-2 rounded-lg border border-white/10 hover:border-primary-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

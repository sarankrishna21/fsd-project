import { BookOpen, RefreshCw } from 'lucide-react';

export default function EmptyState({ icon: Icon = BookOpen, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary-400" />
      </div>
      <h3 className="text-xl font-display font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 max-w-sm mb-6">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <RefreshCw className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="text-xl font-display font-semibold text-white mb-2">Something went wrong</h3>
      <p className="text-gray-400 max-w-sm mb-6">{message || 'Unable to load data. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
}

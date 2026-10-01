import { BookOpen, Users, Shield, Zap, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-4">About Online Library Store</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A modern digital reading platform built as a Full Stack Development academic project, demonstrating real-world software architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: BookOpen, title: 'Rich Library', desc: 'Browse thousands of books across fiction, science, programming, business and more.' },
            { icon: Shield, title: 'Secure Access', desc: 'JWT authentication with role-based access control protects your account and purchases.' },
            { icon: Zap, title: 'Instant Reading', desc: 'Free books are available immediately. Purchased books appear in your library instantly.' },
          ].map(f => (
            <div key={f.title} className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-white mb-6">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'React 18', cat: 'Frontend' },
              { name: 'Vite', cat: 'Build Tool' },
              { name: 'Tailwind CSS', cat: 'Styling' },
              { name: 'React Router', cat: 'Routing' },
              { name: 'Spring Boot 3', cat: 'Backend' },
              { name: 'Spring Security', cat: 'Security' },
              { name: 'JWT', cat: 'Auth' },
              { name: 'MySQL', cat: 'Database' },
            ].map(t => (
              <div key={t.name} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-white font-medium text-sm">{t.name}</p>
                <p className="text-gray-600 text-xs">{t.cat}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-6">Ready to start your reading journey?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary px-8 py-3">Get Started Free</Link>
            <Link to="/books" className="btn-secondary px-8 py-3">Browse Books</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

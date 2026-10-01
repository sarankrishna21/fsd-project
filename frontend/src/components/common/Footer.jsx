import { Link } from 'react-router-dom';
import { BookOpen, Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">
                <span className="gradient-text">Library</span>
                <span className="text-white"> Store</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Your digital reading platform. Discover, purchase, and read thousands of books online.
            </p>
            <div className="flex gap-3">
              {[Globe, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/30 flex items-center justify-center text-gray-400 hover:text-primary-400 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Library</h4>
            <ul className="space-y-2">
              {['Browse Books', 'Free Books', 'New Releases', 'Popular Books', 'Categories'].map(item => (
                <li key={item}>
                  <Link to="/books" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2">
              {['Sign Up', 'Login', 'My Library', 'My Orders', 'Profile'].map(item => (
                <li key={item}>
                  <Link to="/login" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service', 'Help Center'].map(item => (
                <li key={item}>
                  <Link to="/about" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© 2024 Online Library Store. All rights reserved.</p>
          <p className="text-gray-600 text-sm">Built with ❤️ as an FSD Academic Project</p>
        </div>
      </div>
    </footer>
  );
}

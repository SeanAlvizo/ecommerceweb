import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User, LogOut, LayoutDashboard, ChevronDown, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchCart } from '../api';
import { SearchOverlay } from './SearchOverlay';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [cartCount, setCartCount] = React.useState(0);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Track scroll for header style change
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch cart count on mount and when location changes
  React.useEffect(() => {
    const loadCartCount = async () => {
      try {
        const cart = await fetchCart();
        setCartCount(cart.item_count);
      } catch {
        // API might not be available yet
      }
    };
    loadCartCount();

    // Listen for custom cart update events
    const handleCartUpdate = (e: CustomEvent) => {
      setCartCount(e.detail?.item_count || 0);
    };
    window.addEventListener('cart-updated', handleCartUpdate as EventListener);
    return () => window.removeEventListener('cart-updated', handleCartUpdate as EventListener);
  }, [location.pathname]);

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClick = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showUserMenu]);

  const navLinks = [
    { name: 'Collections', path: '/collections' },
    { name: 'Lighting', path: '/collections/lighting' },
    { name: 'Furniture', path: '/collections/furniture' },
    { name: 'Objects', path: '/collections/objects' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'glass shadow-elevated border-b border-outline-variant/10'
          : 'bg-white/95 border-b border-outline-variant/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button 
            className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="text-2xl font-headline font-extrabold tracking-tighter text-gradient">
            ALGURA
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium tracking-wide uppercase px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === link.path 
                    ? 'text-primary bg-primary/5' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-lg"
          >
            <Search size={20} />
          </button>
          <Link to="/wishlist" className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-lg group">
            <Heart size={20} />
          </Link>
          <Link to="/cart" className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-lg relative group">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-tertiary text-on-tertiary text-[10px] font-bold flex items-center justify-center rounded-full px-1 shadow-lg"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="relative ml-2">
              <button
                onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                className="flex items-center gap-2.5 p-2 text-on-surface-variant hover:text-primary transition-all duration-300 rounded-lg hover:bg-primary/5"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">{user?.name?.[0]}</span>
                </div>
                <span className="hidden md:inline text-sm font-semibold">{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className={`hidden md:block transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-3 w-60 bg-surface-container-lowest border border-outline-variant/20 shadow-elevated rounded-xl overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-5 py-4 border-b border-outline-variant/15 bg-gradient-to-r from-primary/5 to-transparent">
                      <p className="font-bold text-sm">{user?.name}</p>
                      <p className="text-on-surface-variant text-xs mt-0.5">{user?.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-sm hover:bg-primary/5 transition-all duration-300 text-primary font-medium"
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/wishlist"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-5 py-3.5 text-sm hover:bg-primary/5 transition-all duration-300"
                    >
                      <Heart size={16} />
                      My Wishlist
                    </Link>
                    <Link
                      to="/order-tracking"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-5 py-3.5 text-sm hover:bg-primary/5 transition-all duration-300"
                    >
                      <ShoppingBag size={16} />
                      Track Orders
                    </Link>
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-sm hover:bg-red-50 text-red-600 transition-all duration-300 border-t border-outline-variant/15"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 ml-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider bg-primary/5 text-primary hover:bg-primary hover:text-on-primary transition-all duration-300 rounded-lg"
            >
              <User size={16} />
              <span className="hidden md:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[320px] bg-surface-container-lowest z-[70] shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-outline-variant/15">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-xl font-headline font-extrabold text-gradient">
                  ALGURA
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all">
                  <X size={22} />
                </button>
              </div>
              <nav className="flex flex-col p-6 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-base font-medium px-4 py-3.5 rounded-lg transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'text-primary bg-primary/5 font-semibold'
                        : 'hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-outline-variant/20 pt-4 mt-4 space-y-1">
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium text-primary hover:bg-primary/5 transition-all duration-300"
                        >
                          <LayoutDashboard size={20} /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-300"
                      >
                        <LogOut size={20} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium hover:text-primary hover:bg-primary/5 transition-all duration-300"
                      >
                        <User size={20} /> Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium hover:text-primary hover:bg-primary/5 transition-all duration-300"
                      >
                        <User size={20} /> Create Account
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};

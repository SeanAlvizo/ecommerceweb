import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { fetchProducts } from '../api';
import type { Product } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchProducts();
        if (products.length > 0) setAllProducts(products as Product[]);
      } catch {
        // Use fallback constants
      }
    };
    loadProducts();
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Search as you type
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = allProducts.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
      setResults(filtered);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, allProducts]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80]"
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[90] bg-surface shadow-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-b-2xl"
          >
            {/* Search Input */}
            <div className="flex items-center gap-4 px-6 md:px-12 py-6 border-b border-outline-variant/15">
              <Search size={24} className="text-on-surface-variant flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for products, categories..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-xl md:text-2xl font-light bg-transparent focus:outline-none placeholder:text-on-surface-variant/40"
              />
              <button
                onClick={onClose}
                className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-lg"
              >
                <X size={22} />
              </button>
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1 px-6 md:px-12 py-8">
              {!query.trim() && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-on-surface-variant/40" />
                  </div>
                  <p className="text-on-surface-variant/60 text-sm uppercase tracking-widest">
                    Start typing to search our collections
                  </p>
                </div>
              )}

              {loading && query.trim() && (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && query.trim() && results.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-on-surface-variant mb-2 font-medium">No results found for "{query}"</p>
                  <p className="text-on-surface-variant/60 text-sm">Try a different search term</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {results.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link
                          to={`/product/${product.id}`}
                          onClick={onClose}
                          className="group block"
                        >
                          <div className="aspect-square bg-surface-container-low overflow-hidden mb-3 relative rounded-xl shadow-card group-hover:shadow-card-hover transition-all duration-500">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm group-hover:text-primary transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-on-surface-variant text-xs uppercase tracking-widest">
                                {product.category}
                              </p>
                            </div>
                            <span className="text-primary font-bold text-sm">${product.price}</span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-outline-variant/15 text-center">
                    <Link
                      to="/collections"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:text-primary-container transition-colors"
                    >
                      View All Collections <ArrowRight size={16} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

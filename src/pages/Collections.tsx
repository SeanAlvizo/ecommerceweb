import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Filter, ChevronDown, ArrowRight, Heart } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../constants';
import { fetchProducts, fetchCategories, toggleWishlist, fetchWishlist } from '../api';
import type { Product, Category } from '../types';

export const Collections = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>(CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [apiProducts, apiCategories] = await Promise.all([
          fetchProducts(categoryId ? { category: categoryId } : {}),
          fetchCategories(),
        ]);
        setProducts(apiProducts as Product[]);
        if (apiCategories.length > 0) setAllCategories(apiCategories as Category[]);
        
        // Fetch wishlist if logged in
        if (localStorage.getItem('algura_token')) {
          const wishData = await fetchWishlist();
          setWishlistIds(wishData.map((item: any) => item.product_id));
        }
      } catch (err) {
        console.log('Using fallback data (API unavailable)');
        const fallbackProducts = categoryId 
          ? PRODUCTS.filter(p => p.category === categoryId)
          : PRODUCTS;
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [categoryId]);

  const category = categoryId ? allCategories.find(c => c.id === categoryId) : null;

  const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem('algura_token')) {
      alert('Please log in to use your wishlist!');
      return;
    }
    try {
      const res = await toggleWishlist(productId);
      if (res.status === 'added') {
        setWishlistIds([...wishlistIds, productId]);
      } else {
        setWishlistIds(wishlistIds.filter(id => id !== productId));
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-outline-variant">/</span>
            <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
            {category && (
              <>
                <span className="text-outline-variant">/</span>
                <span className="text-on-surface">{category.name}</span>
              </>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter">
              {category ? category.name : 'All Collections'}
            </h1>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">
              {category 
                ? category.description 
                : 'Discover our entire range of precision-crafted objects, from architectural lighting to sculptural furniture.'}
            </p>
          </motion.div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center py-5 border-y border-outline-variant/20 mb-12 gap-4 bg-surface-container-lowest/50 rounded-xl px-6 -mx-0">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5">
              <Filter size={16} /> Filter
            </button>
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/collections"
                className={`text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-all duration-300 ${
                  !categoryId ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
                }`}
              >
                All
              </Link>
              {allCategories.map(c => (
                <Link 
                  key={c.id}
                  to={`/collections/${c.id}`}
                  className={`text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-all duration-300 ${
                    categoryId === c.id ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">Sort By</span>
            <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-primary/5 transition-all">
              Featured <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-40 text-center">
            <div className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-on-surface-variant font-medium">Loading products...</p>
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[4/5] bg-surface-container-low overflow-hidden mb-5 relative rounded-2xl shadow-card group-hover:shadow-card-hover transition-all duration-500">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => handleToggleWishlist(e, product.id)}
                      className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                        wishlistIds.includes(product.id)
                          ? 'bg-red-500 text-white shadow-lg pointer-events-auto opacity-100'
                          : 'bg-white/80 backdrop-blur-md text-on-surface-variant hover:text-red-500 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart size={18} fill={wishlistIds.includes(product.id) ? 'currentColor' : 'none'} />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                      <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-lg">
                        View Details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start px-1">
                    <div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                      <p className="text-on-surface-variant text-xs uppercase tracking-widest font-medium">{product.category}</p>
                    </div>
                    <span className="font-bold text-primary text-lg">${product.price}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-on-surface-variant italic text-lg">No products found in this collection.</p>
            <Link to="/collections" className="text-primary font-bold text-sm uppercase tracking-widest mt-4 inline-block hover:text-primary-container transition-colors">
              Browse All Collections →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

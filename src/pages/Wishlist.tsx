import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { fetchWishlist, toggleWishlist, addToCart } from '../api';

export const Wishlist = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await fetchWishlist();
      setItems(data);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      setItems(items.filter(item => item.product_id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      window.dispatchEvent(new CustomEvent('cart-updated'));
      alert('Product added to cart!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="pt-40 pb-20 text-center min-h-screen bg-surface">
        <div className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-on-surface-variant font-medium">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-12">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface">Wishlist</span>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
            <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">My Wishlist</h1>
                <p className="text-on-surface-variant max-w-lg">
                    Keep track of the pieces you love. Move them to your cart when you're ready.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-primary/5 text-primary text-xs font-bold rounded-full border border-primary/10">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </span>
            </div>
        </motion.div>

        {items.length === 0 ? (
          <div className="py-32 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-card">
            <div className="w-24 h-24 bg-surface-container-low rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Heart size={44} className="text-on-surface-variant/30" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Your wishlist is empty</h2>
            <p className="text-on-surface-variant mb-10 max-w-xs mx-auto">
                Discover our curated collections and save your favorite pieces here.
            </p>
            <Link 
              to="/collections"
              className="btn-primary inline-flex"
            >
              Start Exploring <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                <motion.div 
                    key={item.product_id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 border border-outline-variant/10 flex flex-col"
                >
                    <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                        {item.product_image && (
                            <img 
                                src={item.product_image} 
                                alt={item.product_name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                referrerPolicy="no-referrer"
                            />
                        )}
                        <button 
                            onClick={() => handleRemove(item.product_id)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                            title="Remove from wishlist"
                        >
                            <Trash2 size={18} />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent">
                            <button 
                                onClick={() => handleAddToCart(item.product_id)}
                                className="w-full bg-white text-black py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all duration-300 shadow-xl"
                            >
                                <ShoppingBag size={14} /> Add to Cart
                            </button>
                        </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 line-clamp-1">{item.category}</p>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors flex-grow">
                            <Link to={`/product/${item.product_id}`}>{item.product_name}</Link>
                        </h3>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                            <span className="font-headline font-bold text-lg text-gradient">${item.product_price.toFixed(2)}</span>
                            <Link to={`/product/${item.product_id}`} className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

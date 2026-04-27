import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';
import { PRODUCTS, CATEGORIES } from '../constants';
import { fetchProducts, fetchCategories, toggleWishlist, fetchWishlist } from '../api';
import type { Product, Category } from '../types';

export const Home = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [apiProducts, apiCategories] = await Promise.all([
          fetchProducts({ featured: true }),
          fetchCategories(),
        ]);
        if (apiProducts.length > 0) setProducts(apiProducts as Product[]);
        if (apiCategories.length > 0) setCategories(apiCategories as Category[]);
        
        // Fetch wishlist if logged in
        if (localStorage.getItem('algura_token')) {
          const wishData = await fetchWishlist();
          setWishlistIds(wishData.map((item: any) => item.product_id));
        }
      } catch (err) {
        console.log('Using fallback data (API unavailable)');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const featuredProducts = products.filter(p => p.featured);

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
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[65vh] md:h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero"
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl md:max-w-2xl lg:pl-6"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 text-on-primary/80 text-sm font-bold uppercase tracking-[0.3em] mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <Sparkles size={14} className="text-accent-gold" />
              New Collection 2024
            </motion.span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-extrabold leading-[0.95] mb-6 tracking-tighter">
              PRECISION
              <br />
              <span className="italic font-light text-white/90">IN FORM.</span>
            </h1>
            <p className="text-on-primary/80 text-base md:text-lg mb-10 leading-relaxed max-w-lg">
              Discover our latest curation of architectural lighting and sculpted furniture designed for the discerning eye.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/collections" 
                className="bg-white text-primary px-8 py-4 text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-500 flex items-center gap-3 group shadow-lg"
              >
                Explore Collection
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
              <Link
                to="/about"
                className="border border-white/30 text-white px-8 py-4 text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-500 flex items-center gap-3"
              >
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Categories */}
      <section className="py-28 md:py-36 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-label text-tertiary">Curated For You</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">The Collections</h2>
              <p className="text-on-surface-variant max-w-md mt-4 leading-relaxed">
                Explore our curated categories, each representing a unique intersection of engineering and art.
              </p>
            </motion.div>
            <Link
              to="/collections"
              className="text-sm font-bold uppercase tracking-widest text-primary hover:text-primary-container transition-colors flex items-center gap-2 group"
            >
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer"
              >
                <Link to={`/collections/${category.id}`}>
                  <div className="aspect-[4/5] overflow-hidden mb-6 relative rounded-2xl">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        View Collection <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{category.name}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{category.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-28 md:py-36 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="section-label text-tertiary">Selected Works</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Trending Pieces</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {featuredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square bg-surface-container-low overflow-hidden mb-8 relative rounded-2xl shadow-card group-hover:shadow-card-hover transition-shadow duration-500">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-5 py-2.5 text-xs font-bold tracking-widest rounded-full shadow-lg">
                      ${product.price}
                    </div>

                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => handleToggleWishlist(e, product.id)}
                      className={`absolute top-6 left-6 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                        wishlistIds.includes(product.id)
                          ? 'bg-red-500 text-white shadow-lg opacity-100'
                          : 'bg-white/80 backdrop-blur-md text-on-surface-variant hover:text-red-500 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart size={20} fill={wishlistIds.includes(product.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                      <p className="text-on-surface-variant text-sm max-w-sm leading-relaxed">{product.description}</p>
                    </div>
                    <button className="p-3.5 border border-outline-variant/40 rounded-xl hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-300 hover:shadow-elevated group-hover:scale-105">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Section */}
      <section className="py-28 md:py-36 bg-primary text-on-primary overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-tertiary rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/4" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center relative z-10">
          <div className="relative">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1000" 
                alt="Editorial"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border-2 border-tertiary-fixed/20 rounded-3xl" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-label text-tertiary-fixed">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight tracking-tighter">
              Where Engineering <br />
              Meets <span className="italic font-light">Pure Artistry.</span>
            </h2>
            <p className="text-on-primary/75 text-lg mb-10 leading-relaxed">
              We believe that the objects we surround ourselves with should be more than just functional. They should be a testament to human ingenuity and a source of daily inspiration.
            </p>
            <Link 
              to="/about" 
              className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest border-b-2 border-tertiary-fixed/40 pb-2 hover:border-tertiary-fixed hover:text-tertiary-fixed transition-all duration-300 group"
            >
              Learn Our Story <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-16 bg-surface-container-lowest border-t border-outline-variant/15">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '2,500+', label: 'Happy Customers' },
              { value: '150+', label: 'Unique Designs' },
              { value: '12', label: 'Countries Served' },
              { value: '6+', label: 'Years of Craft' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-extrabold text-gradient mb-2">{stat.value}</p>
                <p className="text-on-surface-variant text-sm font-medium uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, Plus, Minus, Shield, Truck, RotateCcw, Check, Heart } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { fetchProduct, addToCart } from '../api';
import type { Product } from '../types';

export const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(true);

  // Safely get images and specs with fallbacks to prevent crashes
  const images = product?.images && Array.isArray(product.images) ? product.images : [];
  const specs = product?.specs && typeof product.specs === 'object' && !Array.isArray(product.specs) ? product.specs : {};

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const apiProduct = await fetchProduct(productId!);
        setProduct(apiProduct as Product);
      } catch (err) {
        // Fallback to constants
        const fallbackProduct = PRODUCTS.find(p => p.id === productId);
        setProduct(fallbackProduct || null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-40 pb-20 text-center min-h-screen bg-surface">
        <div className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-on-surface-variant font-medium">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-20 text-center min-h-screen bg-surface">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/collections" className="text-primary font-bold hover:underline">Back to Collections</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-12">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} className="text-outline-variant" />
          <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
          <ChevronRight size={12} className="text-outline-variant" />
          <Link to={`/collections/${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <ChevronRight size={12} className="text-outline-variant" />
          <span className="text-on-surface">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-4">
              <div className="aspect-[4/5] bg-surface-container-low overflow-hidden relative rounded-2xl shadow-card">
                <AnimatePresence mode="wait">
                  {images.length > 0 ? (
                    <motion.img
                      key={activeImage}
                      src={images[activeImage]}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      <span className="text-lg">No image available</span>
                    </div>
                  )}
                </AnimatePresence>
                
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          activeImage === idx ? 'bg-white w-6' : 'bg-white/40 w-2 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                        activeImage === idx ? 'border-primary shadow-elevated' : 'border-transparent hover:border-outline-variant/30'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="section-label text-tertiary">
                  {product.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">{product.name}</h1>
                <p className="text-3xl font-light text-gradient mb-8">${product.price}</p>
                
                <p className="text-on-surface-variant leading-relaxed mb-10">
                  {product.description}
                </p>

                <div className="space-y-8 mb-10">
                  {Object.keys(specs).length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Specifications</h4>
                      <div className="grid grid-cols-2 gap-y-3 border-t border-outline-variant/20 pt-4">
                        {Object.entries(specs).map(([key, value]) => (
                          <div key={key} className="contents">
                            <span className="text-xs text-on-surface-variant uppercase font-medium">{key}</span>
                            <span className="text-sm font-medium text-right">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-outline-variant/30 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3.5 hover:bg-surface-container-low transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-bold">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3.5 hover:bg-surface-container-low transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className={`flex-1 py-4 px-8 font-bold uppercase tracking-widest rounded-xl transition-all duration-500 flex items-center justify-center gap-3 shadow-lg hover:shadow-elevated active:scale-[0.98] ${
                        addedToCart 
                          ? 'bg-green-600 text-white' 
                          : 'bg-primary text-on-primary hover:bg-primary-container'
                      } ${addingToCart ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {addedToCart ? (
                        <>
                          <Check size={20} />
                          Added to Cart!
                        </>
                      ) : addingToCart ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={20} />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button className="p-3.5 border border-outline-variant/30 rounded-xl hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-300">
                      <Heart size={20} />
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 py-8 border-t border-outline-variant/20">
                  {[
                    { icon: Truck, label: 'Free Shipping', sub: 'Worldwide' },
                    { icon: Shield, label: '2-Year Warranty', sub: 'Full Coverage' },
                    { icon: RotateCcw, label: '30-Day Returns', sub: 'Hassle Free' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-primary/5 transition-all duration-300">
                      <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block">{label}</span>
                        <span className="text-[10px] text-on-surface-variant">{sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

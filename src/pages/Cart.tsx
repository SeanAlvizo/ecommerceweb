import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package, Lock, Truck } from 'lucide-react';
import { fetchCart, updateCartItem, removeFromCart, placeOrder } from '../api';
import type { CartData } from '../api';

export const Cart = () => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Checkout form
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    city: '',
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    try {
      const updatedCart = await updateCartItem(itemId, newQuantity);
      setCart(updatedCart);
      dispatchCartUpdate(updatedCart);
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const updatedCart = await removeFromCart(itemId);
      setCart(updatedCart);
      dispatchCartUpdate(updatedCart);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const orderResult = await placeOrder(formData);
      setOrderPlaced(true);
      setOrderNumber(orderResult.order_number);
      setCart({ items: [], total: 0, item_count: 0 });
      dispatchCartUpdate({ items: [], total: 0, item_count: 0 });
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const dispatchCartUpdate = (cartData: CartData) => {
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cartData }));
  };

  if (loading) {
    return (
      <div className="pt-40 pb-20 text-center min-h-screen bg-surface">
        <div className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-on-surface-variant font-medium">Loading cart...</p>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="pt-40 pb-20 min-h-screen bg-surface">
        <div className="max-w-lg mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-24 h-24 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
          >
            <Package size={44} className="text-green-600" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-4xl font-bold mb-4 tracking-tighter">Order Placed!</h1>
            <p className="text-on-surface-variant mb-2">Your order number is:</p>
            <p className="text-2xl font-bold text-gradient mb-8">{orderNumber}</p>
            <p className="text-on-surface-variant mb-10 leading-relaxed">
              Thank you for your purchase. We'll send you a confirmation email shortly.
            </p>
            <Link 
              to="/collections"
              className="btn-primary inline-flex"
            >
              Continue Shopping <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-12">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface">Shopping Cart</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-12 tracking-tighter"
        >
          Your Cart
        </motion.h1>

        {!cart || cart.items.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-surface-container-low rounded-2xl flex items-center justify-center mx-auto mb-8">
              <ShoppingBag size={44} className="text-on-surface-variant/30" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-on-surface-variant mb-10">Looks like you haven't added anything yet.</p>
            <Link 
              to="/collections"
              className="btn-primary inline-flex"
            >
              Browse Collections <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="border-b border-outline-variant/20 pb-4 mb-6 hidden md:grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {cart.items.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-outline-variant/15 hover:bg-surface-container-lowest/50 -mx-4 px-4 rounded-xl transition-colors duration-300"
                >
                  <div className="md:col-span-6 flex items-center gap-4">
                    <Link to={`/product/${item.product_id}`} className="w-24 h-24 bg-surface-container-low overflow-hidden flex-shrink-0 rounded-xl shadow-card">
                      {item.product_image && (
                        <img 
                          src={item.product_image} 
                          alt={item.product_name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </Link>
                    <div>
                      <Link to={`/product/${item.product_id}`} className="font-bold hover:text-primary transition-colors">
                        {item.product_name}
                      </Link>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{item.category}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 text-center font-medium">
                    ${item.product_price.toFixed(2)}
                  </div>
                  <div className="md:col-span-2 flex items-center justify-center gap-3">
                    <div className="flex items-center border border-outline-variant/25 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-surface-container-low transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-surface-container-low transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="md:col-span-2 text-right font-bold text-primary">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-surface-container-lowest p-8 sticky top-32 rounded-2xl shadow-card border border-outline-variant/10">
                <h3 className="text-xl font-bold mb-8">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal ({cart.item_count} items)</span>
                    <span className="font-medium">${cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span className="font-medium text-green-600 flex items-center gap-1.5">
                      <Truck size={14} /> Free
                    </span>
                  </div>
                  <div className="border-t border-outline-variant/20 pt-4 flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-gradient">${cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {!showCheckout ? (
                  <button 
                    onClick={() => setShowCheckout(true)}
                    className="btn-primary w-full"
                  >
                    Proceed to Checkout <ArrowRight size={18} />
                  </button>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleCheckout}
                    className="space-y-4"
                  >
                    <h4 className="font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Lock size={14} className="text-primary" />
                      Shipping Details
                    </h4>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      required
                      value={formData.customer_name}
                      onChange={e => setFormData({...formData, customer_name: e.target.value})}
                      className="input-premium"
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      required
                      value={formData.customer_email}
                      onChange={e => setFormData({...formData, customer_email: e.target.value})}
                      className="input-premium"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.customer_phone}
                      onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                      className="input-premium"
                    />
                    <textarea
                      placeholder="Shipping Address *"
                      required
                      value={formData.shipping_address}
                      onChange={e => setFormData({...formData, shipping_address: e.target.value})}
                      rows={3}
                      className="input-premium resize-none"
                    />
                    <input
                      type="text"
                      placeholder="City *"
                      required
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="input-premium"
                    />
                    <button 
                      type="submit"
                      disabled={submitting}
                      className={`btn-primary w-full ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          Place Order
                        </>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="w-full py-3 text-sm text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest font-medium"
                    >
                      Back to Summary
                    </button>
                  </motion.form>
                )}

                {/* Trust */}
                <div className="mt-6 pt-6 border-t border-outline-variant/15 flex items-center justify-center gap-2 text-on-surface-variant">
                  <Lock size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

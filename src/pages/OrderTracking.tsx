import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, Package, MapPin, Clock, ChevronRight, ChevronDown, ChevronUp,
  Truck, CheckCircle, Box, XCircle, ShoppingBag, Eye, Calendar, CreditCard
} from 'lucide-react';
import { fetchOrder, fetchMyOrders, receiveOrder } from '../api';
import type { MyOrder } from '../api';
import { useAuth } from '../context/AuthContext';

interface OrderDetails {
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{
    product_name: string;
    product_slug?: string | null;
    product_image?: string | null;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

const statusSteps = ['pending', 'processing', 'shipped', 'delivered', 'completed'];

const statusConfig: Record<string, {
  icon: typeof Package;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    glowColor: 'shadow-amber-100',
  },
  processing: {
    icon: Box,
    label: 'Processing',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    glowColor: 'shadow-blue-100',
  },
  shipped: {
    icon: Truck,
    label: 'Shipped',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    glowColor: 'shadow-indigo-100',
  },
  delivered: {
    icon: CheckCircle,
    label: 'Delivered',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    glowColor: 'shadow-green-100',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    glowColor: 'shadow-emerald-100',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    glowColor: 'shadow-red-100',
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${config.bgColor} ${config.color} ${config.borderColor}`}>
      <Icon size={13} />
      {config.label}
    </span>
  );
};

const ProgressTracker = ({ status }: { status: string }) => {
  const currentIdx = statusSteps.indexOf(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-red-500">
          <XCircle size={20} />
          <span className="text-sm font-bold">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between relative py-2">
      {/* Background line */}
      <div className="absolute top-1/2 left-[20px] right-[20px] h-[3px] bg-outline-variant/15 rounded-full -translate-y-[calc(50%-10px)]" />
      {/* Active line */}
      <div
        className="absolute top-1/2 left-[20px] h-[3px] bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 -translate-y-[calc(50%-10px)]"
        style={{ width: `calc(${(Math.max(0, currentIdx) / (statusSteps.length - 1)) * 100}% - 40px)` }}
      />

      {statusSteps.map((step, idx) => {
        const config = statusConfig[step];
        const Icon = config.icon;
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={step} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                isCurrent
                  ? 'bg-primary text-on-primary shadow-lg scale-110 ring-4 ring-primary/20'
                  : isActive
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'
              }`}
            >
              <Icon size={16} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant/50'
            }`}>
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order, defaultExpanded = false }: { order: OrderDetails | MyOrder; defaultExpanded?: boolean }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [receiving, setReceiving] = useState(false);

  const handleReceiveOrder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Have you received your order? This will mark it as completed.')) return;
    
    setReceiving(true);
    try {
      const res = await receiveOrder(order.order_number);
      if (res.success) {
        alert('Order marked as received!');
        window.location.reload(); // Quick way to refresh orders
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    } finally {
      setReceiving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest border border-outline-variant/12 rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300"
    >
      {/* Order Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-surface-container-low/30 transition-colors"
      >
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
            <Package size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-base">{order.order_number}</h3>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag size={12} />
                {order.items.map(i => i.quantity).reduce((a, b) => a + b, 0)} items
              </span>
              <span className="flex items-center gap-1">
                <CreditCard size={12} />
                <span className="font-bold text-on-surface">${Number(order.total_amount).toFixed(2)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {/* Mini product thumbnails */}
          <div className="hidden sm:flex items-center -space-x-2">
            {order.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-surface-container-high">
                {item.product_image ? (
                  <img src={item.product_image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={12} className="text-on-surface-variant" />
                  </div>
                )}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-8 h-8 rounded-lg bg-surface-container-high border-2 border-white shadow-sm flex items-center justify-center">
                <span className="text-[10px] font-bold text-on-surface-variant">+{order.items.length - 3}</span>
              </div>
            )}
          </div>
          {order.status === 'delivered' && (
            <button
              onClick={handleReceiveOrder}
              disabled={receiving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-all shadow-md disabled:opacity-50"
            >
              {receiving ? 'Updating...' : 'Order Received'}
            </button>
          )}
          {expanded ? <ChevronUp size={18} className="text-on-surface-variant" /> : <ChevronDown size={18} className="text-on-surface-variant" />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-5">
              {/* Progress Tracker */}
              <div className="bg-surface-container-low/50 rounded-xl p-5 border border-outline-variant/10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Order Progress</h4>
                <ProgressTracker status={order.status} />
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Items Ordered</h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-3 px-4 bg-surface-container-low/30 rounded-xl hover:bg-surface-container-low/60 transition-colors">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0 shadow-sm">
                        {item.product_image ? (
                          item.product_slug ? (
                            <Link to={`/product/${item.product_slug}`}>
                              <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
                            </Link>
                          ) : (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-on-surface-variant" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.product_slug ? (
                          <Link to={`/product/${item.product_slug}`} className="font-bold text-sm hover:text-primary transition-colors">
                            {item.product_name}
                          </Link>
                        ) : (
                          <p className="font-bold text-sm">{item.product_name}</p>
                        )}
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <span className="font-bold text-sm text-primary flex-shrink-0">
                        ${Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-container-low/30 rounded-xl p-4 border border-outline-variant/10">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Shipping To</h5>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-on-surface-variant text-xs">{order.shipping_address}</p>
                      <p className="text-on-surface-variant text-xs">{order.city}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low/30 rounded-xl p-4 border border-outline-variant/10">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Payment Summary</h5>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant text-xs">Items ({order.items.map(i => i.quantity).reduce((a, b) => a + b, 0)})</span>
                      <span className="text-xs font-medium">${Number(order.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant text-xs">Shipping</span>
                      <span className="text-xs font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-outline-variant/15">
                      <span className="font-bold text-sm">Total</span>
                      <span className="font-bold text-sm text-gradient">${Number(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const OrderTracking = () => {
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<OrderDetails | null>(null);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMyOrders, setLoadingMyOrders] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Auto-search if coming from success page
  useEffect(() => {
    const stateOrder = location.state?.orderNumber;
    if (stateOrder) {
      setOrderNumber(stateOrder);
      triggerDirectSearch(stateOrder);
    }
  }, [location.state]);

  const triggerDirectSearch = async (num: string) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await fetchOrder(num) as OrderDetails;
      setSearchedOrder(data);
    } catch (err) {
      setError('Order not found.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load orders for logged-in users
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadMyOrders();
    }
  }, [isAuthenticated, authLoading]);

  const loadMyOrders = async () => {
    setLoadingMyOrders(true);
    try {
      const orders = await fetchMyOrders();
      setMyOrders(orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingMyOrders(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      let queryNumber = orderNumber.trim();
      if (!queryNumber.startsWith('ALG-') && !queryNumber.startsWith('alg-')) {
        queryNumber = 'ALG-' + queryNumber;
      }
      const data = await fetchOrder(queryNumber) as OrderDetails;
      setSearchedOrder(data);
    } catch (err) {
      setSearchedOrder(null);
      setError('Order not found. Please check your order number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusCounts: Record<string, number> = { all: myOrders.length };
  myOrders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const filteredOrders = activeFilter === 'all'
    ? myOrders
    : myOrders.filter(o => o.status === activeFilter);

  const filterTabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="pt-20 min-h-screen bg-surface">
      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-primary text-on-primary overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-tertiary rounded-full blur-[120px] opacity-12 translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light rounded-full blur-[100px] opacity-12 -translate-y-1/2 translate-x-1/4" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Package size={32} className="text-tertiary-fixed" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3">
              {isAuthenticated ? 'My Orders' : 'Track Your Order'}
            </h1>
            <p className="text-on-primary/60 text-lg max-w-md mx-auto mb-8">
              {isAuthenticated
                ? `Welcome back, ${user?.name?.split(' ')[0]}! Here are all your orders.`
                : 'Enter your order number to see real-time updates on your purchase.'
              }
            </p>

            {/* Search bar — always show for quick lookup */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search by order number..."
                  value={orderNumber}
                  onChange={e => setOrderNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white text-on-surface text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-tertiary-fixed shadow-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-tertiary text-on-tertiary px-8 py-4 font-bold uppercase tracking-widest text-sm rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-14 max-w-5xl mx-auto px-6">
        {/* Searched order result */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-on-surface-variant font-medium">Looking up your order...</p>
          </div>
        )}

        {!loading && error && searched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 p-8 text-center rounded-2xl mb-8"
          >
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <Link
              to="/contact"
              className="text-primary text-sm font-bold uppercase tracking-widest hover:text-primary-container transition-colors"
            >
              Contact Support →
            </Link>
          </motion.div>
        )}

        {!loading && searchedOrder && searched && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className="text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Search Result</h2>
            </div>
            <OrderCard order={searchedOrder} defaultExpanded={true} />
          </div>
        )}

        {/* My Orders — for authenticated users */}
        {isAuthenticated && (
          <>
            {loadingMyOrders ? (
              <div className="text-center py-16">
                <div className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-on-surface-variant font-medium">Loading your orders...</p>
              </div>
            ) : myOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={36} className="text-on-surface-variant" />
                </div>
                <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                <p className="text-on-surface-variant mb-8 max-w-sm mx-auto">
                  You haven't placed any orders. Start shopping and your orders will appear here!
                </p>
                <Link to="/collections" className="btn-primary">
                  Browse Collections <ChevronRight size={16} />
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
                  {filterTabs.map(tab => {
                    const count = statusCounts[tab.key] || 0;
                    if (tab.key !== 'all' && count === 0) return null;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                          activeFilter === tab.key
                            ? 'bg-primary text-on-primary shadow-elevated'
                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/15'
                        }`}
                      >
                        {tab.label}
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                          activeFilter === tab.key
                            ? 'bg-white/20 text-on-primary'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order, idx) => (
                      <motion.div
                        key={order.order_number}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <OrderCard order={order} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredOrders.length === 0 && (
                  <div className="text-center py-12 text-on-surface-variant">
                    <p className="font-medium">No orders with this status.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Help Section for guests */}
        {!isAuthenticated && !loading && !searchedOrder && (
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold mb-4">Need Help?</h3>
            <p className="text-on-surface-variant mb-8 max-w-md mx-auto leading-relaxed">
              Log in to see all your orders in one place, or contact our support team for assistance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login" className="btn-primary">
                Log In to View Orders <ChevronRight size={16} />
              </Link>
              <Link to="/contact" className="btn-outline">
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

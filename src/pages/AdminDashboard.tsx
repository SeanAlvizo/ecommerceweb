import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard, ShoppingBag, Package, Users, LogOut,
  DollarSign, TrendingUp, AlertTriangle, ChevronDown,
  Eye, RefreshCw, BarChart3, Clock, CheckCircle, Truck, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  monthly_revenue: number;
  total_products: number;
  total_customers: number;
  pending_orders: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  items_count: number;
  created_at: string;
}

interface AdminOrder extends RecentOrder {
  customer_phone: string;
  shipping_address: string;
  city: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  category_slug: string;
  images: string[];
  featured: boolean;
  stock: number;
  created_at: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

type ActiveTab = 'dashboard' | 'orders' | 'products' | 'categories' | 'customers';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  processing: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
};

export const AdminDashboard = () => {
  const { user, token, logout, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [adminCategories, setAdminCategories] = useState<any[]>([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    featured: false,
    image_url: '',
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  useEffect(() => {
    if (authLoading) return; // Wait for auth to initialize
    
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadDashboard();
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'products') {
      loadProducts();
      loadAdminCategories();
    }
    if (activeTab === 'categories') loadAdminCategories();
    if (activeTab === 'customers') loadCustomers();
  }, [activeTab]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', { headers });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.success) {
        setStats(data.data.stats);
        setRecentOrders(data.data.recent_orders);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const url = orderFilter !== 'all' ? `/api/admin/orders?status=${orderFilter}` : '/api/admin/orders';
      const res = await fetch(url, { headers });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products', { headers });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.success) setProducts(data.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers', { headers });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.success) setCustomers(data.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };
  
  const loadAdminCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { headers });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.success) setAdminCategories(data.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category_id: parseInt(productForm.category_id),
        images: [productForm.image_url],
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        resetProductForm();
        loadProducts();
      } else {
        const data = await res.json();
        alert(`Validation failed: ${data.message || JSON.stringify(data.errors)}`);
      }
    } catch (err: any) {
      console.error('Failed to save product:', err);
      alert(`Failed to save product: ${err.message}`);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers });
      if (res.ok) loadProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        setShowCategoryModal(false);
        setCategoryForm({ name: '', description: '' });
        loadAdminCategories();
      }
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) {
        loadAdminCategories();
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      stock: '',
      featured: false,
      image_url: '',
    });
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: adminCategories.find(c => c.name === product.category)?.id.toString() || '',
      stock: product.stock.toString(),
      featured: product.featured,
      image_url: product.images[0] || '',
    });
    setShowProductModal(true);
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      loadOrders();
      if (activeTab === 'dashboard') loadDashboard();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
  }, [orderFilter]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders' as ActiveTab, label: 'Orders', icon: Package },
    { id: 'products' as ActiveTab, label: 'Products', icon: ShoppingBag },
    { id: 'categories' as ActiveTab, label: 'Categories', icon: BarChart3 },
    { id: 'customers' as ActiveTab, label: 'Customers', icon: Users },
  ];

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#161822] border-r border-white/5 flex flex-col transition-all duration-300 fixed h-full z-40`}>
        <div className="p-6 border-b border-white/5">
          <Link to="/" className={`font-headline font-extrabold tracking-tighter text-white ${sidebarOpen ? 'text-xl' : 'text-sm text-center block'}`}>
            {sidebarOpen ? 'ALGURA' : 'A'}
          </Link>
          {sidebarOpen && <p className="text-gray-500 text-xs mt-1">Admin Dashboard</p>}
        </div>

        <nav className="flex-1 py-6">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border-r-2 border-indigo-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          {sidebarOpen && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <span className="text-indigo-400 text-sm font-bold">{user?.name?.[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <BarChart3 size={20} />
            </button>
            <h1 className="text-white text-lg font-bold capitalize">{activeTab}</h1>
          </div>
          <Link
            to="/"
            className="text-xs text-gray-400 hover:text-indigo-400 transition-colors uppercase tracking-widest font-bold flex items-center gap-2"
          >
            <Eye size={14} /> View Store
          </Link>
        </header>

        <div className="p-8">
          {/* ========== DASHBOARD TAB ========== */}
          {activeTab === 'dashboard' && stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {[
                  { label: 'Total Revenue', value: `$${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                  { label: 'Monthly Revenue', value: `$${stats.monthly_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                  { label: 'Total Orders', value: stats.total_orders.toString(), icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: 'Pending Orders', value: stats.pending_orders.toString(), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-[#161822] border border-white/5 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                      <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <stat.icon size={18} className={stat.color} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="bg-[#161822] border border-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Products</span>
                    <ShoppingBag size={18} className="text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_products}</p>
                </div>
                <div className="bg-[#161822] border border-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Registered Customers</span>
                    <Users size={18} className="text-cyan-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_customers}</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-[#161822] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-white font-bold">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest"
                  >
                    View All →
                  </button>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package size={32} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-500 text-sm">No orders yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                          <th className="text-left px-6 py-3 font-bold">Order</th>
                          <th className="text-left px-6 py-3 font-bold">Customer</th>
                          <th className="text-left px-6 py-3 font-bold">Amount</th>
                          <th className="text-left px-6 py-3 font-bold">Status</th>
                          <th className="text-left px-6 py-3 font-bold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map(order => {
                          const StatusIcon = statusIcons[order.status] || Clock;
                          return (
                            <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-indigo-400 text-sm font-mono">{order.order_number}</span>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-white text-sm">{order.customer_name}</p>
                                <p className="text-gray-500 text-xs">{order.customer_email}</p>
                              </td>
                              <td className="px-6 py-4 text-white text-sm font-medium">
                                ${order.total_amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                  <StatusIcon size={12} />
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========== ORDERS TAB ========== */}
          {activeTab === 'orders' && (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                      orderFilter === f
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="bg-[#161822] border border-white/5 rounded-xl overflow-hidden">
                {orders.length === 0 ? (
                  <div className="p-16 text-center">
                    <Package size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                          <th className="text-left px-6 py-3 font-bold">Order</th>
                          <th className="text-left px-6 py-3 font-bold">Customer</th>
                          <th className="text-left px-6 py-3 font-bold">Items</th>
                          <th className="text-left px-6 py-3 font-bold">Amount</th>
                          <th className="text-left px-6 py-3 font-bold">City</th>
                          <th className="text-left px-6 py-3 font-bold">Status</th>
                          <th className="text-left px-6 py-3 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-indigo-400 text-sm font-mono">{order.order_number}</span>
                              <p className="text-gray-600 text-xs mt-1">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-white text-sm">{order.customer_name}</p>
                              <p className="text-gray-500 text-xs">{order.customer_email}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{order.items_count}</td>
                            <td className="px-6 py-4 text-white text-sm font-medium">${order.total_amount.toFixed(2)}</td>
                            <td className="px-6 py-4 text-gray-400 text-sm">{order.city}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${statusColors[order.status]}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative group">
                                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-white/5 px-3 py-1.5 rounded transition-colors">
                                  Update <ChevronDown size={12} />
                                </button>
                                <div className="absolute right-0 top-full mt-1 bg-[#1e2030] border border-white/10 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[140px]">
                                  {['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].map(s => (
                                    <button
                                      key={s}
                                      onClick={() => updateOrderStatus(order.id, s)}
                                      className={`w-full text-left px-4 py-2 text-xs capitalize hover:bg-white/5 transition-colors ${
                                        order.status === s ? 'text-indigo-400' : 'text-gray-300'
                                      }`}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========== PRODUCTS TAB ========== */}
          {activeTab === 'products' && (
            <div className="bg-[#161822] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-white font-bold">All Products ({products.length})</h3>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      resetProductForm();
                      setShowProductModal(true);
                    }}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    + Add Product
                  </button>
                </div>
              {products.length === 0 ? (
                <div className="p-16 text-center">
                  <ShoppingBag size={40} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                        <th className="text-left px-6 py-3 font-bold">Product</th>
                        <th className="text-left px-6 py-3 font-bold">Category</th>
                        <th className="text-left px-6 py-3 font-bold">Price</th>
                        <th className="text-left px-6 py-3 font-bold">Stock</th>
                        <th className="text-left px-6 py-3 font-bold">Featured</th>
                        <th className="text-right px-6 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {product.images?.[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div>
                                <p className="text-white text-sm font-medium">{product.name}</p>
                                <p className="text-gray-500 text-xs font-mono">{product.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300 text-sm">{product.category}</span>
                          </td>
                          <td className="px-6 py-4 text-white text-sm font-medium">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${
                              product.stock <= 5 ? 'text-red-400' : product.stock <= 10 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {product.stock}
                              {product.stock <= 5 && (
                                <AlertTriangle size={12} className="inline ml-1.5 text-red-400" />
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block w-2 h-2 rounded-full ${product.featured ? 'bg-indigo-400' : 'bg-gray-600'}`} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 text-gray-400 hover:text-white bg-white/5 rounded transition-colors"
                              >
                                <RefreshCw size={14} />
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 rounded transition-colors"
                              >
                                <XCircle size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== CUSTOMERS TAB ========== */}
          {activeTab === 'customers' && (
            <div className="bg-[#161822] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-white font-bold">Registered Customers ({customers.length})</h3>
              </div>
              {customers.length === 0 ? (
                <div className="p-16 text-center">
                  <Users size={40} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-500">No customers registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                        <th className="text-left px-6 py-3 font-bold">Customer</th>
                        <th className="text-left px-6 py-3 font-bold">Email</th>
                        <th className="text-left px-6 py-3 font-bold">Phone</th>
                        <th className="text-left px-6 py-3 font-bold">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(customer => (
                        <tr key={customer.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <span className="text-indigo-400 text-sm font-bold">{customer.name[0]}</span>
                              </div>
                              <span className="text-white text-sm font-medium">{customer.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 text-sm">{customer.email}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{customer.phone || '—'}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(customer.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== CATEGORIES TAB ========== */}
          {activeTab === 'categories' && (
            <div className="bg-[#161822] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-bold">Categories ({adminCategories.length})</h3>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="btn-primary text-xs py-2 px-4"
                >
                  + Add Category
                </button>
              </div>
              {adminCategories.length === 0 ? (
                <div className="p-16 text-center">
                  <BarChart3 size={40} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-500">No categories found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                        <th className="text-left px-6 py-3 font-bold">Name</th>
                        <th className="text-left px-6 py-3 font-bold">Description</th>
                        <th className="text-left px-6 py-3 font-bold">Products</th>
                        <th className="text-right px-6 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminCategories.map(cat => (
                        <tr key={cat.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-white text-sm font-medium">{cat.name}</p>
                            <p className="text-gray-500 text-xs font-mono">{cat.slug}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{cat.description || '—'}</td>
                          <td className="px-6 py-4 text-indigo-400 text-sm font-bold">{cat.products_count}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deleteCategory(cat.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 rounded transition-colors"
                            >
                              <XCircle size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ========== PRODUCT MODAL ========== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#161822] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={saveProduct} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Category</label>
                    <select
                      value={productForm.category_id}
                      onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="" disabled className="bg-[#161822]">Select Category</option>
                      {adminCategories.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#161822]">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Stock</label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={productForm.image_url}
                      onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      required
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={e => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Featured Product</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-2 text-sm text-gray-400 hover:text-white font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-8"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========== CATEGORY MODAL ========== */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#161822] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add New Category</h2>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={saveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-2 text-sm text-gray-400 hover:text-white font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-8"
                >
                  Create Category
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

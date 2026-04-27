// API Service for connecting frontend to Laravel backend
const API_BASE_URL = '/api';

// Generate a unique session ID for cart tracking
function getSessionId(): string {
  let sessionId = localStorage.getItem('algura_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('algura_session_id', sessionId);
  }
  return sessionId;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Session-Id': getSessionId(),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }

  return data;
}

// ============ Categories ============

export async function fetchCategories() {
  const response = await apiRequest<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      description: string;
      image: string;
      product_count: number;
    }>;
  }>('/categories');
  return response.data;
}

export async function fetchCategory(slug: string) {
  const response = await apiRequest<{
    success: boolean;
    data: {
      id: string;
      name: string;
      description: string;
      image: string;
      products: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        category: string;
        images: string[];
        specs: Record<string, string>;
        featured: boolean;
      }>;
    };
  }>(`/categories/${slug}`);
  return response.data;
}

// ============ Products ============

export async function fetchProducts(params?: {
  category?: string;
  featured?: boolean;
  sort?: string;
  order?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.featured) searchParams.set('featured', 'true');
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.order) searchParams.set('order', params.order);

  const queryString = searchParams.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      category: string;
      images: string[];
      specs: Record<string, string>;
      featured: boolean;
      stock: number;
    }>;
  }>(endpoint);
  return response.data;
}

export async function fetchProduct(slug: string) {
  const response = await apiRequest<{
    success: boolean;
    data: {
      id: string;
      name: string;
      description: string;
      price: number;
      category: string;
      images: string[];
      specs: Record<string, string>;
      featured: boolean;
      stock: number;
    };
  }>(`/products/${slug}`);
  return response.data;
}

// ============ Cart ============

export interface CartItem {
  id: number;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
  category: string;
  quantity: number;
  subtotal: number;
}

export interface CartData {
  items: CartItem[];
  total: number;
  item_count: number;
}

export async function fetchCart(): Promise<CartData> {
  const response = await apiRequest<{
    success: boolean;
    data: CartData;
  }>('/cart');
  return response.data;
}

export async function addToCart(productId: string, quantity: number = 1): Promise<CartData> {
  const response = await apiRequest<{
    success: boolean;
    data: CartData;
  }>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  return response.data;
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartData> {
  const response = await apiRequest<{
    success: boolean;
    data: CartData;
  }>(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
  return response.data;
}

export async function removeFromCart(itemId: number): Promise<CartData> {
  const response = await apiRequest<{
    success: boolean;
    data: CartData;
  }>(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
  return response.data;
}

// ============ Orders ============

export interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  city: string;
}

export async function placeOrder(orderData: OrderData) {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: {
      order_number: string;
      total_amount: number;
      status: string;
      items: Array<{
        product_name: string;
        quantity: number;
        price: number;
        subtotal: number;
      }>;
    };
  }>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
  return response.data;
}

export async function fetchOrder(orderNumber: string) {
  const response = await apiRequest<{
    success: boolean;
    data: {
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
        product_slug: string | null;
        product_image: string | null;
        quantity: number;
        price: number;
        subtotal: number;
      }>;
    };
  }>(`/orders/${orderNumber}`);
  return response.data;
}

export interface MyOrderItem {
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface MyOrder {
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: MyOrderItem[];
}

export async function fetchMyOrders(): Promise<MyOrder[]> {
  const token = localStorage.getItem('algura_token');
  const response = await apiRequest<{
    success: boolean;
    data: MyOrder[];
  }>('/my-orders', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
}

// ============ Health Check ============

export async function checkApiHealth() {
  try {
    const response = await apiRequest<{
      success: boolean;
      message: string;
    }>('/health');
    return response.success;
  } catch {
    return false;
  }
}

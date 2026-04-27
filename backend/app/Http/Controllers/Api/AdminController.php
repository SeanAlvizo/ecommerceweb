<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Dashboard stats
     */
    public function dashboard()
    {
        $totalOrders = Order::count();
        $totalRevenue = Order::sum('total_amount');
        $totalProducts = Product::count();
        $totalCustomers = User::where('role', 'customer')->count();
        $pendingOrders = Order::where('status', 'pending')->count();

        // Revenue this month
        $monthlyRevenue = Order::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        // Recent orders
        $recentOrders = Order::with('items.product')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'total_amount' => (float) $order->total_amount,
                    'status' => $order->status,
                    'items_count' => $order->items->sum('quantity'),
                    'created_at' => $order->created_at->toISOString(),
                ];
            });

        // Top products by order count
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name', 'products.slug', 'products.price',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue'))
            ->groupBy('products.id', 'products.name', 'products.slug', 'products.price')
            ->orderBy('total_sold', 'desc')
            ->take(5)
            ->get();

        // Orders by status
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // Low stock products
        $lowStock = Product::where('stock', '<=', 5)
            ->select('id', 'slug', 'name', 'stock', 'price')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_orders' => $totalOrders,
                    'total_revenue' => (float) $totalRevenue,
                    'monthly_revenue' => (float) $monthlyRevenue,
                    'total_products' => $totalProducts,
                    'total_customers' => $totalCustomers,
                    'pending_orders' => $pendingOrders,
                ],
                'recent_orders' => $recentOrders,
                'top_products' => $topProducts,
                'orders_by_status' => $ordersByStatus,
                'low_stock' => $lowStock,
            ],
        ]);
    }

    /**
     * Get all orders for admin
     */
    public function orders(Request $request)
    {
        $query = Order::with('items.product');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->get()->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'city' => $order->city,
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status,
                'items_count' => $order->items->sum('quantity'),
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_name' => $item->product->name ?? 'Deleted Product',
                        'quantity' => $item->quantity,
                        'price' => (float) $item->price,
                        'subtotal' => (float) ($item->price * $item->quantity),
                    ];
                }),
                'created_at' => $order->created_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, $orderId)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,completed,cancelled',
        ]);

        $order = Order::findOrFail($orderId);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order status updated',
            'data' => [
                'order_number' => $order->order_number,
                'status' => $order->status,
            ],
        ]);
    }

    /**
     * Get all products for admin
     */
    public function products()
    {
        $products = Product::with('category')->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'slug' => $product->slug,
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
                'category' => $product->category->name ?? 'Unknown',
                'category_slug' => $product->category->slug ?? '',
                'images' => $product->images,
                'featured' => $product->featured,
                'stock' => $product->stock,
                'created_at' => $product->created_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Store new product
     */
    public function storeProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
            'featured' => 'boolean',
            'images' => 'required|array|min:1',
            'images.*' => 'string|url',
        ]);

        $slug = \Illuminate\Support\Str::slug($request->name);
        
        // Ensure slug is unique
        $originalSlug = $slug;
        $count = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'price' => $request->price,
            'category_id' => $request->category_id,
            'stock' => $request->stock,
            'featured' => $request->featured ?? false,
            'images' => $request->images,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product,
        ], 201);
    }

    /**
     * Update product
     */
    public function updateProduct(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'stock' => 'sometimes|integer|min:0',
            'featured' => 'sometimes|boolean',
            'images' => 'sometimes|array',
            'images.*' => 'string|url',
        ]);

        if ($request->has('name')) {
            $product->name = $request->name;
            $product->slug = \Illuminate\Support\Str::slug($request->name);
        }
        if ($request->has('description')) $product->description = $request->description;
        if ($request->has('price')) $product->price = $request->price;
        if ($request->has('category_id')) $product->category_id = $request->category_id;
        if ($request->has('stock')) $product->stock = $request->stock;
        if ($request->has('featured')) $product->featured = $request->featured;
        if ($request->has('images')) $product->images = $request->images;

        $product->save();

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product,
        ]);
    }

    /**
     * Delete a product
     */
    public function deleteProduct($productId)
    {
        $product = Product::findOrFail($productId);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Get all categories
     */
    public function adminCategories()
    {
        $categories = Category::withCount('products')->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Store new category
     */
    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        $slug = \Illuminate\Support\Str::slug($request->name);

        $category = Category::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    /**
     * Delete a category
     */
    public function deleteCategory($categoryId)
    {
        $category = Category::findOrFail($categoryId);
        
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category that has products',
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }

    /**
     * Get all customers
     */
    public function customers()
    {
        $customers = User::where('role', 'customer')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'created_at' => $user->created_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }
}

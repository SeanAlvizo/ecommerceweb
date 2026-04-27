<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get all products (with optional category filter)
     */
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Filter by category slug
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter featured only
        if ($request->has('featured') && $request->featured === 'true') {
            $query->where('featured', true);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('description', 'LIKE', "%$search%");
            });
        }

        // Sort
        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('order', 'desc');
        if (in_array($sortBy, ['price', 'name', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir);
        }

        $products = $query->get();

        return response()->json([
            'success' => true,
            'data' => $products->map(function ($product) {
                return [
                    'id' => $product->slug,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => (float) $product->price,
                    'category' => $product->category->slug,
                    'images' => $product->images,
                    'specs' => $product->specs,
                    'featured' => $product->featured,
                    'stock' => $product->stock,
                ];
            }),
        ]);
    }

    /**
     * Get a single product by slug
     */
    public function show($slug)
    {
        $product = Product::where('slug', $slug)->with('category')->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $product->slug,
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
                'category' => $product->category->slug,
                'images' => $product->images,
                'specs' => $product->specs,
                'featured' => $product->featured,
                'stock' => $product->stock,
            ],
        ]);
    }
}

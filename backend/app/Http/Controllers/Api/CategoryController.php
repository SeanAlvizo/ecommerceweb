<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index()
    {
        $categories = Category::withCount('products')->get();

        return response()->json([
            'success' => true,
            'data' => $categories->map(function ($category) {
                return [
                    'id' => $category->slug,
                    'name' => $category->name,
                    'description' => $category->description,
                    'image' => $category->image,
                    'product_count' => $category->products_count,
                ];
            }),
        ]);
    }

    /**
     * Get a single category with its products
     */
    public function show($slug)
    {
        $category = Category::where('slug', $slug)->with('products')->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $category->slug,
                'name' => $category->name,
                'description' => $category->description,
                'image' => $category->image,
                'products' => $category->products->map(function ($product) {
                    return [
                        'id' => $product->slug,
                        'name' => $product->name,
                        'description' => $product->description,
                        'price' => (float) $product->price,
                        'category' => $product->category->slug,
                        'images' => $product->images,
                        'specs' => $product->specs,
                        'featured' => $product->featured,
                    ];
                }),
            ],
        ]);
    }
}

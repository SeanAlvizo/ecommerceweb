<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $wishlist = Wishlist::where('user_id', $user->id)
            ->with(['product.category'])
            ->get()
            ->map(function ($item) {
                $product = $item->product;
                return [
                    'id' => $item->id,
                    'product_id' => $product->slug,
                    'product_name' => $product->name,
                    'product_image' => $product->images[0] ?? null,
                    'product_price' => (float) $product->price,
                    'category' => $product->category->slug,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $wishlist,
        ]);
    }

    /**
     * Toggle product in wishlist
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|string',
        ]);

        $user = $request->user();
        $product = Product::where('slug', $request->product_id)->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $wishlistItem = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($wishlistItem) {
            $wishlistItem->delete();
            return response()->json([
                'success' => true,
                'message' => 'Product removed from wishlist',
                'status' => 'removed',
            ]);
        } else {
            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
            return response()->json([
                'success' => true,
                'message' => 'Product added to wishlist',
                'status' => 'added',
            ]);
        }
    }
}

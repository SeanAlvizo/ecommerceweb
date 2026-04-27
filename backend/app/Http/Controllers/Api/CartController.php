<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get or create a cart by session ID
     */
    private function getCart(Request $request)
    {
        $sessionId = $request->header('X-Session-Id', $request->get('session_id'));

        if (!$sessionId) {
            return null;
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    /**
     * Get cart contents
     */
    public function index(Request $request)
    {
        $cart = $this->getCart($request);

        if (!$cart) {
            return response()->json([
                'success' => true,
                'data' => [
                    'items' => [],
                    'total' => 0,
                    'item_count' => 0,
                ],
            ]);
        }

        $cart->load('items.product.category');

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product->slug,
                        'product_name' => $item->product->name,
                        'product_image' => $item->product->images[0] ?? null,
                        'product_price' => (float) $item->product->price,
                        'category' => $item->product->category->slug,
                        'quantity' => $item->quantity,
                        'subtotal' => (float) ($item->product->price * $item->quantity),
                    ];
                }),
                'total' => (float) $cart->total,
                'item_count' => $cart->items->sum('quantity'),
            ],
        ]);
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|string',
            'quantity' => 'integer|min:1',
        ]);

        $sessionId = $request->header('X-Session-Id', $request->get('session_id'));
        if (!$sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Session ID is required',
            ], 400);
        }

        $product = Product::where('slug', $request->product_id)->first();
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $cart = Cart::firstOrCreate(['session_id' => $sessionId]);
        $quantity = $request->get('quantity', 1);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
            ]);
        }

        $cart->load('items.product.category');

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'data' => [
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product->slug,
                        'product_name' => $item->product->name,
                        'product_image' => $item->product->images[0] ?? null,
                        'product_price' => (float) $item->product->price,
                        'category' => $item->product->category->slug,
                        'quantity' => $item->quantity,
                        'subtotal' => (float) ($item->product->price * $item->quantity),
                    ];
                }),
                'total' => (float) $cart->total,
                'item_count' => $cart->items->sum('quantity'),
            ],
        ]);
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $cartItem = CartItem::find($itemId);
        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        if ($request->quantity === 0) {
            $cartItem->delete();
        } else {
            $cartItem->quantity = $request->quantity;
            $cartItem->save();
        }

        $cart = $cartItem->cart;
        $cart->load('items.product.category');

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
            'data' => [
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product->slug,
                        'product_name' => $item->product->name,
                        'product_image' => $item->product->images[0] ?? null,
                        'product_price' => (float) $item->product->price,
                        'category' => $item->product->category->slug,
                        'quantity' => $item->quantity,
                        'subtotal' => (float) ($item->product->price * $item->quantity),
                    ];
                }),
                'total' => (float) $cart->total,
                'item_count' => $cart->items->sum('quantity'),
            ],
        ]);
    }

    /**
     * Remove item from cart
     */
    public function removeItem($itemId)
    {
        $cartItem = CartItem::find($itemId);
        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        $cart = $cartItem->cart;
        $cartItem->delete();
        $cart->load('items.product.category');

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
            'data' => [
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product->slug,
                        'product_name' => $item->product->name,
                        'product_image' => $item->product->images[0] ?? null,
                        'product_price' => (float) $item->product->price,
                        'category' => $item->product->category->slug,
                        'quantity' => $item->quantity,
                        'subtotal' => (float) ($item->product->price * $item->quantity),
                    ];
                }),
                'total' => (float) $cart->total,
                'item_count' => $cart->items->sum('quantity'),
            ],
        ]);
    }
}

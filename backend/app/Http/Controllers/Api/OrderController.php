<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Place an order from cart
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'shipping_address' => 'required|string',
            'city' => 'required|string|max:255',
            'payment_method' => 'required|string|in:cod,gcash',
        ]);

        $sessionId = $request->header('X-Session-Id', $request->get('session_id'));
        if (!$sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Session ID is required',
            ], 400);
        }

        $cart = Cart::where('session_id', $sessionId)->with('items.product')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty',
            ], 400);
        }

        try {
            DB::beginTransaction();

            $totalAmount = $cart->items->sum(function ($item) {
                return $item->product->price * $item->quantity;
            });

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'shipping_address' => $request->shipping_address,
                'city' => $request->city,
                'payment_method' => $request->payment_method,
                'total_amount' => $totalAmount,
                'status' => 'pending',
            ]);

            foreach ($cart->items as $cartItem) {
                // Reduce stock
                $product = $cartItem->product;
                if ($product->stock < $cartItem->quantity) {
                    throw new \Exception("Product '{$product->name}' is out of stock.");
                }
                $product->stock -= $cartItem->quantity;
                $product->save();

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->product->price,
                ]);
            }

            // Clear the cart after order is placed
            $cart->items()->delete();
            $cart->delete();

            DB::commit();

            $order->load('items.product');

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => [
                    'order_number' => $order->order_number,
                    'total_amount' => (float) $order->total_amount,
                    'status' => $order->status,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'product_name' => $item->product->name,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) ($item->price * $item->quantity),
                        ];
                    }),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order. Please try again.',
            ], 500);
        }
    }

    /**
     * Get order by order number
     */
    public function show($orderNumber)
    {
        $orderNumber = strtoupper(trim($orderNumber));
        if (!preg_match('/^ALG-/i', $orderNumber)) {
            $orderNumber = 'ALG-' . $orderNumber;
        }

        $order = Order::where('order_number', $orderNumber)
            ->with('items.product')
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatOrder($order),
        ]);
    }

    /**
     * Get all orders for the authenticated user (matched by email)
     */
    public function myOrders(Request $request)
    {
        $user = $request->user();

        $orders = Order::where('customer_email', $user->email)
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return $this->formatOrder($order);
            });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Mark order as received by customer
     */
    public function markAsReceived($orderNumber, Request $request)
    {
        $user = $request->user();
        $order = Order::where('order_number', $orderNumber)->where('customer_email', $user->email)->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->status !== 'delivered') {
            return response()->json(['success' => false, 'message' => 'Order cannot be received yet'], 400);
        }

        $order->status = 'completed';
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order marked as received',
        ]);
    }

    /**
     * Format an order for API response
     */
    private function formatOrder($order)
    {
        return [
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_email' => $order->customer_email,
            'shipping_address' => $order->shipping_address,
            'city' => $order->city,
            'total_amount' => (float) $order->total_amount,
            'status' => $order->status,
            'created_at' => $order->created_at->toISOString(),
            'items' => $order->items->map(function ($item) {
                $product = $item->product;
                return [
                    'product_name' => $product->name ?? 'Deleted Product',
                    'product_slug' => $product->slug ?? null,
                    'product_image' => $product && $product->images ? ($product->images[0] ?? null) : null,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'subtotal' => (float) ($item->price * $item->quantity),
                ];
            }),
        ];
    }
}

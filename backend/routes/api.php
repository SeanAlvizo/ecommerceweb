<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| ALGURA Furniture Store API
| Base URL: /api
|
*/

// ============ Public Routes ============

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// Products
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Cart (session-based, no auth required)
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart/items', [CartController::class, 'addItem']);
Route::put('/cart/items/{itemId}', [CartController::class, 'updateItem']);
Route::delete('/cart/items/{itemId}', [CartController::class, 'removeItem']);

// Orders (public endpoints)
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'ALGURA API is running',
        'timestamp' => now()->toISOString(),
    ]);
});

// ============ Authenticated Routes ============

Route::middleware('auth:sanctum')->group(function () {
    // Profile
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Customer orders
    Route::get('/my-orders', [OrderController::class, 'myOrders']);

    // ============ Admin-Only Routes ============
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::put('/orders/{orderId}/status', [AdminController::class, 'updateOrderStatus']);
        Route::get('/products', [AdminController::class, 'products']);
        Route::post('/products', [AdminController::class, 'storeProduct']);
        Route::put('/products/{productId}', [AdminController::class, 'updateProduct']);
        Route::delete('/products/{productId}', [AdminController::class, 'deleteProduct']);
        
        Route::get('/categories', [AdminController::class, 'adminCategories']);
        Route::post('/categories', [AdminController::class, 'storeCategory']);
        Route::delete('/categories/{categoryId}', [AdminController::class, 'deleteCategory']);

        Route::get('/customers', [AdminController::class, 'customers']);
    });
});

<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$db = config('database.connections.mysql.database');
echo "Current DB: " . $db . "\n";

// Check what tables exist in each database
$pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');

// Check furniture_db
echo "\n=== furniture_db tables ===\n";
$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'furniture_db'");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
if (empty($tables)) {
    echo "(empty - no tables)\n";
} else {
    foreach ($tables as $t) echo "  - $t\n";
}

// Check primewear
echo "\n=== primewear tables ===\n";
$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'primewear'");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
if (empty($tables)) {
    echo "(empty - no tables)\n";
} else {
    foreach ($tables as $t) echo "  - $t\n";
}

// Check primewears2.0
echo "\n=== primewears2.0 tables ===\n";
$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'primewears2.0'");
$tables2 = $stmt->fetchAll(PDO::FETCH_COLUMN);
if (empty($tables2)) {
    echo "(empty - no tables)\n";
} else {
    foreach ($tables2 as $t) echo "  - $t\n";
}

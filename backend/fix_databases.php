<?php
/**
 * Fix script: Move ALGURA furniture tables from 'primewear' to 'furniture_db'
 * Then restore primewear from primewears2.0
 */
$pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== Step 1: Copy ALGURA tables from primewear → furniture_db ===\n\n";

// Get all tables from primewear
$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'primewear' AND table_type = 'BASE TABLE'");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

// Disable FK checks
$pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

foreach ($tables as $table) {
    echo "  Copying: $table ... ";
    try {
        // Create table in furniture_db from primewear
        $pdo->exec("CREATE TABLE IF NOT EXISTS `furniture_db`.`$table` LIKE `primewear`.`$table`");
        // Copy data
        $pdo->exec("INSERT INTO `furniture_db`.`$table` SELECT * FROM `primewear`.`$table`");
        echo "OK\n";
    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
    }
}

echo "\n=== Step 2: Drop ALGURA tables from primewear ===\n\n";

foreach ($tables as $table) {
    echo "  Dropping primewear.$table ... ";
    try {
        $pdo->exec("DROP TABLE IF EXISTS `primewear`.`$table`");
        echo "OK\n";
    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
    }
}

echo "\n=== Step 3: Restore primewear tables from primewears2.0 ===\n\n";

// Get tables from primewears2.0
$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'primewears2.0' AND table_type = 'BASE TABLE'");
$tables2 = $stmt->fetchAll(PDO::FETCH_COLUMN);

foreach ($tables2 as $table) {
    echo "  Restoring: $table ... ";
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `primewear`.`$table` LIKE `primewears2.0`.`$table`");
        $pdo->exec("INSERT INTO `primewear`.`$table` SELECT * FROM `primewears2.0`.`$table`");
        echo "OK\n";
    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
    }
}

$pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

echo "\n=== Verification ===\n\n";

// Verify furniture_db
$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'furniture_db'");
$fTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo "furniture_db tables: " . count($fTables) . "\n";
foreach ($fTables as $t) echo "  ✓ $t\n";

echo "\n";

// Verify primewear
$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'primewear'");
$pTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo "primewear tables: " . count($pTables) . "\n";
foreach ($pTables as $t) echo "  ✓ $t\n";

echo "\n✅ Done! Both databases restored.\n";

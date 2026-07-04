<?php
$host = 'localhost';
$username = 'root';
$password = ''; // Default XAMPP/Laragon password is empty

try {
    // 1. Connect without database to create it
    echo "Connecting to MySQL server...\n";
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Creating database 'martabak_jepang_db'...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS martabak_jepang_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database created successfully.\n";
    
    // 2. Connect to the new database
    $pdo = new PDO("mysql:host=$host;dbname=martabak_jepang_db", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 3. Load schema
    echo "Loading schema...\n";
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    if ($schema !== false) {
        $pdo->exec($schema);
        echo "Schema loaded successfully.\n";
    } else {
        echo "Failed to read schema.sql\n";
    }
    
    // 4. Load seed
    echo "Loading seed data...\n";
    $seed = file_get_contents(__DIR__ . '/seed.sql');
    if ($seed !== false) {
        $pdo->exec($seed);
        echo "Seed data loaded successfully.\n";
    } else {
        echo "Failed to read seed.sql\n";
    }
    
    echo "\nAll database setup completed successfully!\n";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

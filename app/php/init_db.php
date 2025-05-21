<?php
// init_db.php
// This script initializes the SQLite database by creating tables from schema.sql.

// Define the path to the database file and schema file.
// Adjust these paths if your file structure is different.
$dbPath = __DIR__ . '/../db/app.db'; // Database will be created in the /app/db/ folder
$schemaPath = __DIR__ . '/../db/schema.sql';

try {
    // Create a new PDO instance (SQLite specific)
    // This will create the database file if it doesn't exist.
    $pdo = new PDO('sqlite:' . $dbPath);

    // Set error mode to exceptions for better error handling.
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Read the schema.sql file.
    $sql = file_get_contents($schemaPath);
    if ($sql === false) {
        die("Error: Could not read schema.sql file at " . htmlspecialchars($schemaPath) . "\n");
    }

    // Execute the SQL commands from schema.sql.
    // PDO can execute multiple statements separated by semicolons if they are executed one by one,
    // or if the driver supports it. For broader compatibility, especially with older SQLite versions
    // via PDO, it's safer to execute them if they were simple.
    // However, file_get_contents reads the whole file as one string.
    // Most modern PDO SQLite drivers can handle multi-statement queries from a string.
    $pdo->exec($sql);

    echo "Database initialized successfully with schema from " . htmlspecialchars($schemaPath) . "\n";
    echo "Database file created at " . htmlspecialchars($dbPath) . "\n";

} catch (PDOException $e) {
    // Catch any errors and display a message.
    die("Database initialization failed: " . $e->getMessage() . "\n");
}

?>

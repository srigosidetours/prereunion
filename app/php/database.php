<?php
// /app/php/database.php
require_once __DIR__ . '/config.php';

/**
 * Establishes a PDO connection to the SQLite database.
 * @return PDO|null Returns a PDO connection object on success, or null on failure.
 */
function getDBConnection() {
    static $pdo = null; // Static variable to hold the connection

    if ($pdo === null) {
        try {
            $pdo = new PDO('sqlite:' . DB_PATH);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // In a real application, you might log this error or handle it more gracefully
            error_log("Database connection error: " . $e->getMessage());
            return null; 
        }
    }
    return $pdo;
}
?>

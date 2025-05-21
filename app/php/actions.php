<?php
// /app/php/actions.php
require_once __DIR__ . '/database.php';

/**
 * Adds a new activity to the database.
 * @param string $description Description of the activity.
 * @param string $userName User's first name.
 * @param string $userSurname User's last name.
 * @param string $userOffice User's office.
 * @return int|false The ID of the newly created activity on success, or false on failure.
 */
function addActivity($description, $userName, $userSurname, $userOffice) {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    try {
        $stmt = $pdo->prepare("INSERT INTO activities (description, user_name, user_surname, user_office) VALUES (:description, :user_name, :user_surname, :user_office)");
        $stmt->execute([
            ':description' => $description,
            ':user_name' => $userName,
            ':user_surname' => $userSurname,
            ':user_office' => $userOffice
        ]);
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("addActivity error: " . $e->getMessage());
        return false;
    }
}

/**
 * Retrieves activities for a specific user.
 * @param string $userName User's first name.
 * @param string $userSurname User's last name.
 * @param string $userOffice User's office.
 * @param bool $includeSoftDeleted Whether to include soft-deleted activities.
 * @return array|false An array of activities on success, or false on failure.
 */
function getActivities($userName, $userSurname, $userOffice, $includeSoftDeleted = false) {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    $sql = "SELECT * FROM activities WHERE user_name = :user_name AND user_surname = :user_surname AND user_office = :user_office";
    if (!$includeSoftDeleted) {
        $sql .= " AND soft_deleted = 0";
    }
    $sql .= " ORDER BY creation_date DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':user_name' => $userName,
            ':user_surname' => $userSurname,
            ':user_office' => $userOffice
        ]);
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("getActivities error: " . $e->getMessage());
        return false;
    }
}

/**
 * Retrieves all activities (typically for admin use).
 * @param bool $includeSoftDeleted Whether to include soft-deleted activities.
 * @return array|false An array of all activities on success, or false on failure.
 */
function getAllActivities($includeSoftDeleted = false) {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    $sql = "SELECT * FROM activities";
    if (!$includeSoftDeleted) {
        $sql .= " WHERE soft_deleted = 0";
    }
    $sql .= " ORDER BY creation_date DESC";

    try {
        $stmt = $pdo->query($sql);
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("getAllActivities error: " . $e->getMessage());
        return false;
    }
}

/**
 * Updates the status of an activity.
 * @param int $activityId The ID of the activity to update.
 * @param string $status The new status (e.g., 'pending', 'completed').
 * @return bool True on success, false on failure.
 */
function updateActivityStatus($activityId, $status) {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    try {
        $stmt = $pdo->prepare("UPDATE activities SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $activityId]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        error_log("updateActivityStatus error: " . $e->getMessage());
        return false;
    }
}

/**
 * Soft deletes an activity if it belongs to the specified user.
 * @param int $activityId The ID of the activity to soft delete.
 * @param string $userName User's first name.
 * @param string $userSurname User's last name.
 * @param string $userOffice User's office.
 * @return bool True on success (activity was soft-deleted or already soft-deleted), false on failure or if user does not own activity.
 */
function softDeleteActivity($activityId, $userName, $userSurname, $userOffice) {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    try {
        // First verify ownership
        $checkStmt = $pdo->prepare("SELECT id FROM activities WHERE id = :id AND user_name = :user_name AND user_surname = :user_surname AND user_office = :user_office");
        $checkStmt->execute([
            ':id' => $activityId,
            ':user_name' => $userName,
            ':user_surname' => $userSurname,
            ':user_office' => $userOffice
        ]);
        if ($checkStmt->fetchColumn() === false) {
            error_log("softDeleteActivity error: User does not own activity or activity does not exist.");
            return false; // User does not own this activity or activity not found
        }

        $stmt = $pdo->prepare("UPDATE activities SET soft_deleted = 1 WHERE id = :id");
        $stmt->execute([':id' => $activityId]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        error_log("softDeleteActivity error: " . $e->getMessage());
        return false;
    }
}

/**
 * Approves or rejects an activity (admin action).
 * This function updates the status. 'approved' or 'rejected' are examples.
 * @param int $activityId The ID of the activity.
 * @param string $newStatus The new status to set (e.g., 'approved', 'rejected').
 * @return bool True on success, false on failure.
 */
function approveActivity($activityId, $newStatus) {
    // This is essentially the same as updateActivityStatus but named for clarity in admin actions.
    // You might add additional logic here if needed, e.g., logging who approved it.
    return updateActivityStatus($activityId, $newStatus);
}

/**
 * Retrieves all users from the users table (admin action).
 * @return array|false An array of users on success, or false on failure.
 */
function getUsers() {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    try {
        $stmt = $pdo->query("SELECT id, name, surname, office, is_admin FROM users ORDER BY name ASC");
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("getUsers error: " . $e->getMessage());
        return false;
    }
}

/**
 * Adds a new user to the users table (admin action).
 * @param string $name User's first name.
 * @param string $surname User's last name.
 * @param string $office User's office.
 * @param int $isAdmin 0 for regular user, 1 for admin.
 * @return int|false The ID of the newly created user on success, or false on failure.
 */
function addUser($name, $surname, $office, $isAdmin = 0) {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, surname, office, is_admin) VALUES (:name, :surname, :office, :is_admin)");
        $stmt->execute([
            ':name' => $name,
            ':surname' => $surname,
            ':office' => $office,
            ':is_admin' => (int)$isAdmin // Ensure it's an integer
        ]);
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("addUser error: " . $e->getMessage());
        return false;
    }
}

// You might want to add a small section here for testing these functions if run directly,
// but it's generally better to test them through actual page interactions or dedicated test scripts.
// Example:
// if (php_sapi_name() === 'cli' && realpath($argv[0]) === realpath(__FILE__)) {
//     echo "Running tests for actions.php...\n";
//     // Test addActivity
//     $activityId = addActivity("Test CLI Activity", "Cli", "User", "TestOffice");
//     if ($activityId) {
//         echo "addActivity test PASS. ID: $activityId\n";
//         // Test getActivities
//         $activities = getActivities("Cli", "User", "TestOffice");
//         print_r($activities);
//         // Test updateActivityStatus
//         updateActivityStatus($activityId, "completed");
//         // Test softDeleteActivity
//         softDeleteActivity($activityId, "Cli", "User", "TestOffice");
//     } else {
//         echo "addActivity test FAIL.\n";
//     }
//     // Test getUsers
//     print_r(getUsers());
// }
?>

-- Main table for activities
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- e.g., 'pending', 'completed', 'approved', 'rejected'
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_name TEXT, -- Storing user info directly as per localStorage approach for users
    user_surname TEXT,
    user_office TEXT,
    soft_deleted INTEGER DEFAULT 0 -- 0 for not deleted, 1 for soft deleted
);

-- Table for users (primarily for admins or future explicit user accounts)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    office TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0 -- 0 for regular user, 1 for admin
);

-- Optional: Insert a default admin user for testing
INSERT INTO users (name, surname, office, is_admin) VALUES ('Admin', 'User', 'MainOffice', 1);

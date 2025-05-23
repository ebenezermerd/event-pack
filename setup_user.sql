-- Drop user if exists
DROP USER IF EXISTS 'event_ease_user'@'localhost';

-- Create user with mysql_native_password authentication
CREATE USER 'event_ease_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'StrongPassword123';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON event_ease.* TO 'event_ease_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES; 
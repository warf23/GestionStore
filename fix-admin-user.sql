-- Fix: Create admin user with correct password hash
-- Copy this and run in Supabase SQL Editor

-- First, let's make sure the table exists and check current data
SELECT 'Current users in database:' as info;
SELECT * FROM utilisateurs;

-- Insert the admin user with correct password hash
-- Password: admin123
INSERT INTO utilisateurs (email, nom, prenom, role, password_hash) 
VALUES (
    'admin@store.com', 
    'Admin', 
    'System', 
    'admin', 
    '$2b$10$oBoggYww/9LqHpze75KJ5O6eE4zJct72YSb2bAfgGNTYl8KYy908m'
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = '$2b$10$oBoggYww/9LqHpze75KJ5O6eE4zJct72YSb2bAfgGNTYl8KYy908m',
    role = 'admin',
    nom = 'Admin',
    prenom = 'System';

-- Verify the admin user was created
SELECT 'Admin user created successfully:' as info;
SELECT id, email, nom, prenom, role, created_at FROM utilisateurs WHERE email = 'admin@store.com';
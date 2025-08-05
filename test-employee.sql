-- Add a test employee user
-- Run this in Supabase SQL Editor after the main schema

-- Create an employee user for testing
-- Email: employe@store.com
-- Password: employe123
INSERT INTO utilisateurs (email, nom, prenom, role, password_hash) 
VALUES (
    'employe@store.com', 
    'Dupont', 
    'Jean', 
    'employe', 
    '$2b$10$YQzK.eH8QI5YqP5ioGz8z.7qI6PzY1Yr3B0sJZhRxL2Y9eP7X5Z8S'
)
ON CONFLICT (email) DO NOTHING;

-- Verify both users exist
SELECT email, nom, prenom, role, created_at 
FROM utilisateurs 
ORDER BY created_at;
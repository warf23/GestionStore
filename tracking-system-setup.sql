-- Employee Activity Tracking System Setup
-- Execute this in your Supabase SQL Editor to add tracking functionality

-- Create activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE')),
    table_name VARCHAR(50) NOT NULL CHECK (table_name IN ('ventes', 'achats', 'utilisateurs')),
    record_id INT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_utilisateur_id ON activity_logs(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_table_name ON activity_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_record_id ON activity_logs(record_id);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins only
CREATE POLICY "Admins can view all activity logs" ON activity_logs 
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM utilisateurs 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Create policy for inserting activity logs (system use)
CREATE POLICY "System can insert activity logs" ON activity_logs 
    FOR INSERT TO authenticated WITH CHECK (true);

-- Verify setup
SELECT 
    'Activity tracking system setup completed!' as status,
    COUNT(*) as existing_logs
FROM activity_logs;
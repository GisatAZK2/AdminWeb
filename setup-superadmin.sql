-- Create superadmin table for admin authentication
CREATE TABLE IF NOT EXISTS superadmin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
-- Note: This password hash is for 'admin123' using bcrypt with salt rounds 12
INSERT INTO superadmin (username, email, password, role) 
VALUES (
  'admin', 
  'admin@example.com', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5W', 
  'superadmin'
) ON CONFLICT (username) DO NOTHING;

-- Enable Row Level Security (optional, for better security)
ALTER TABLE superadmin ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to access all rows
CREATE POLICY "Service role can access all superadmin records" ON superadmin
  FOR ALL USING (auth.role() = 'service_role');
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSuperadminTable() {
  try {
    console.log('Creating superadmin table...')
    
    // Try to create the table using a raw SQL query
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS superadmin (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (error) {
      console.log('Could not create table via RPC:', error.message)
      console.log('Please create the table manually in Supabase dashboard')
      return false
    }
    
    console.log('Table created successfully')
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const { data: insertData, error: insertError } = await supabase
      .from('superadmin')
      .insert({
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'superadmin'
      })
    
    if (insertError) {
      console.log('Error creating admin user:', insertError.message)
      return false
    }
    
    console.log('Default admin user created successfully')
    console.log('Username: admin')
    console.log('Password: admin123')
    
    return true
    
  } catch (error) {
    console.error('Setup failed:', error.message)
    return false
  }
}

createSuperadminTable().then(success => {
  if (success) {
    console.log('Setup completed successfully!')
  } else {
    console.log('Setup failed. Please run the SQL manually in Supabase dashboard.')
  }
  process.exit(success ? 0 : 1)
})
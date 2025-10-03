// Manual setup script - run this after creating the superadmin table in Supabase dashboard
require('dotenv').config()
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

async function createDefaultAdmin() {
  try {
    console.log('Creating default admin user...')
    
    // Check if admin already exists
    const { data: existing } = await supabase
      .from('superadmin')
      .select('username')
      .eq('username', 'admin')
      .single()
    
    if (existing) {
      console.log('Admin user already exists')
      return true
    }
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const { data, error } = await supabase
      .from('superadmin')
      .insert({
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'superadmin'
      })
    
    if (error) {
      console.log('Error creating admin user:', error.message)
      return false
    }
    
    console.log('Default admin user created successfully!')
    console.log('Username: admin')
    console.log('Password: admin123')
    
    return true
    
  } catch (error) {
    console.error('Setup failed:', error.message)
    return false
  }
}

createDefaultAdmin().then(success => {
  if (success) {
    console.log('Admin setup completed!')
  } else {
    console.log('Admin setup failed.')
  }
  process.exit(success ? 0 : 1)
})

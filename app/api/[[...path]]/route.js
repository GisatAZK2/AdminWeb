import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword, verifyPassword, generateToken, requireAuth } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// Initialize superadmin table and default admin user
async function initializeSupabase() {
  try {
    // Check if default admin exists
    const { data: admins, error } = await supabase.from('superadmin').select('*').limit(1)
    
    if (error) {
      console.log('Superadmin table might not exist:', error.message)
      console.log('Please create the superadmin table in Supabase with the following schema:')
      console.log(`
        CREATE TABLE superadmin (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
      return
    }
    
    if (!admins || admins.length === 0) {
      // Create default admin
      const hashedPass = await hashPassword('admin123')
      const { error: insertError } = await supabase.from('superadmin').insert({
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPass,
        role: 'superadmin'
      })
      
      if (insertError) {
        console.log('Error creating default admin:', insertError)
      } else {
        console.log('Default admin created successfully')
      }
    }
  } catch (error) {
    console.log('Initialization error:', error)
  }
}

// Initialize on first load
initializeSupabase()

export async function GET(request, { params }) {
  const url = new URL(request.url)
  const path = params?.path || []
  const pathname = path.join('/')

  try {
    // Auth routes
    if (pathname === 'auth/me') {
      const authResult = await requireAuth(request)
      if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status })
      }
      return NextResponse.json({ user: authResult.user })
    }

    // Sellers routes
    if (pathname === 'sellers') {
      const { data, error } = await supabase.from('sellers').select('*').order('created_at', { ascending: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    if (pathname.startsWith('sellers/') && path.length === 2) {
      const sellerId = path[1]
      const { data, error } = await supabase.from('sellers').select('*').eq('id', sellerId).single()
      if (error) return NextResponse.json({ error: error.message }, { status: 404 })
      return NextResponse.json(data)
    }

    // Categories routes
    if (pathname === 'categories') {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    if (pathname.startsWith('categories/') && path.length === 2) {
      const categoryId = path[1]
      const { data, error } = await supabase.from('categories').select('*').eq('id', categoryId).single()
      if (error) return NextResponse.json({ error: error.message }, { status: 404 })
      return NextResponse.json(data)
    }

    // Events routes
    if (pathname === 'events') {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    if (pathname.startsWith('events/') && path.length === 2) {
      const eventId = path[1]
      const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single()
      if (error) return NextResponse.json({ error: error.message }, { status: 404 })
      return NextResponse.json(data)
    }

    // Admin users routes
    if (pathname === 'admins') {
      const authResult = await requireAuth(request)
      if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status })
      }
      
      const { data, error } = await supabase
        .from('superadmin')
        .select('id, username, email, role, created_at, updated_at')
        .order('created_at', { ascending: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Setup endpoint - provides instructions for manual setup
    if (pathname === 'setup') {
      return NextResponse.json({ 
        message: 'Manual setup required',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Run the following SQL commands:',
          '',
          'CREATE TABLE IF NOT EXISTS superadmin (',
          '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '  username VARCHAR(255) UNIQUE NOT NULL,',
          '  email VARCHAR(255) UNIQUE NOT NULL,',
          '  password VARCHAR(255) NOT NULL,',
          '  role VARCHAR(50) DEFAULT \'admin\',',
          '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
          '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
          ');',
          '',
          '-- Insert default admin (password: admin123)',
          'INSERT INTO superadmin (username, email, password, role) VALUES (',
          '  \'admin\',',
          '  \'admin@example.com\',',
          '  \'$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5W\',',
          '  \'superadmin\'',
          ') ON CONFLICT (username) DO NOTHING;',
          '',
          '4. After running the SQL, you can login with:',
          '   Username: admin',
          '   Password: admin123'
        ],
        sqlFile: 'A complete SQL file is available at /app/setup-superadmin.sql'
      })
    }

    // Stats/Analytics
    if (pathname === 'stats') {
      const authResult = await requireAuth(request)
      if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status })
      }

      const [sellersCount, categoriesCount, eventsCount] = await Promise.all([
        supabase.from('sellers').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true })
      ])

      return NextResponse.json({
        sellers: sellersCount.count || 0,
        categories: categoriesCount.count || 0,
        events: eventsCount.count || 0
      })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const path = params?.path || []
  const pathname = path.join('/')

  try {
    const body = await request.json()

    // Auth login
    if (pathname === 'auth/login') {
      const { username, password } = body

      const { data: admin, error } = await supabase
        .from('superadmin')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !admin) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const isValidPassword = await verifyPassword(password, admin.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const token = generateToken({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      })

      return NextResponse.json({
        token,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      })
    }

    // Protected routes - require authentication
    const authResult = await requireAuth(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Create new seller
    if (pathname === 'sellers') {
      const newSeller = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase.from('sellers').insert(newSeller).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Create new category
    if (pathname === 'categories') {
      const newCategory = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase.from('categories').insert(newCategory).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Create new event
    if (pathname === 'events') {
      const newEvent = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase.from('events').insert(newEvent).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Create new admin
    if (pathname === 'admins') {
      const hashedPass = await hashPassword(body.password)
      const newAdmin = {
        id: uuidv4(),
        username: body.username,
        email: body.email,
        password: hashedPass,
        role: body.role || 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase.from('superadmin').insert(newAdmin).select('id, username, email, role, created_at, updated_at').single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const path = params?.path || []
  const pathname = path.join('/')

  try {
    const authResult = await requireAuth(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = await request.json()

    // Update seller
    if (pathname.startsWith('sellers/') && path.length === 2) {
      const sellerId = path[1]
      const updateData = {
        ...body,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('sellers')
        .update(updateData)
        .eq('id', sellerId)
        .select()
        .single()
        
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Update category
    if (pathname.startsWith('categories/') && path.length === 2) {
      const categoryId = path[1]
      const updateData = {
        ...body,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', categoryId)
        .select()
        .single()
        
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Update event
    if (pathname.startsWith('events/') && path.length === 2) {
      const eventId = path[1]
      const updateData = {
        ...body,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single()
        
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const path = params?.path || []
  const pathname = path.join('/')

  try {
    const authResult = await requireAuth(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Delete seller
    if (pathname.startsWith('sellers/') && path.length === 2) {
      const sellerId = path[1]
      const { error } = await supabase.from('sellers').delete().eq('id', sellerId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // Delete category
    if (pathname.startsWith('categories/') && path.length === 2) {
      const categoryId = path[1]
      const { error } = await supabase.from('categories').delete().eq('id', categoryId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // Delete event
    if (pathname.startsWith('events/') && path.length === 2) {
      const eventId = path[1]
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // Delete admin
    if (pathname.startsWith('admins/') && path.length === 2) {
      const adminId = path[1]
      const { error } = await supabase.from('superadmin').delete().eq('id', adminId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // Upload file to Supabase Storage
    if (pathname === 'upload') {
      try {
        const formData = await request.formData()
        const file = formData.get('file')
        const bucket = formData.get('bucket') || 'uploads'
        const folder = formData.get('folder') || 'files'
        
        if (!file) {
          return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = `${folder}/${fileName}`

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (error) {
          console.error('Supabase upload error:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get public URL
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath)

        return NextResponse.json({ 
          success: true, 
          url: publicData.publicUrl,
          path: filePath
        })
      } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)
}

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const getTokenFromRequest = (request) => {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export const requireAuth = async (request) => {
  const token = getTokenFromRequest(request)
  if (!token) {
    return { error: 'No token provided', status: 401 }
  }
  
  const payload = verifyToken(token)
  if (!payload) {
    return { error: 'Invalid token', status: 401 }
  }
  
  return { user: payload }
}
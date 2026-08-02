import { User } from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'

export const registerUser = async ({ name, email, password, role }) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : ''

  // 1. Duplicate email check
  const existingUser = await User.findOne({ email: normalizedEmail })
  if (existingUser) {
    const error = new Error('An account with this email already exists')
    error.statusCode = 400
    throw error
  }

  // 2. Prevent creating duplicate Manager accounts. All public signups are Finance Executive accounts.
  let assignedRole = 'finance'
  if (role && role.toLowerCase() === 'manager') {
    // If someone explicitly tries to register as Manager, reject or restrict
    if (normalizedEmail !== 'manager@gmail.com') {
      const error = new Error('Manager role is system restricted. Public registrations are assigned Finance Executive role.')
      error.statusCode = 403
      throw error
    }
    assignedRole = 'manager'
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: assignedRole,
  })

  const token = generateToken(user._id.toString(), user.role)

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    token,
  }
}

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : ''

  // Look up user in MongoDB database
  const user = await User.findOne({ email: normalizedEmail })
  if (!user) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  // Compare hashed password in MongoDB
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const token = generateToken(user._id.toString(), user.role)

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    token,
  }
}

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password')
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }
  return user
}

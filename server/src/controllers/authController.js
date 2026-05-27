import Admin from '../models/Admin.js'
import generateToken from '../utils/generateToken.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'

// @desc    Register a new admin
// @route   POST /api/auth/register-admin
// @access  Public (for initial setup, or secured depending on setup)
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const adminExists = await Admin.findOne({ email })
  if (adminExists) {
    return sendError(res, 'Admin already exists with this email', 400)
  }

  const admin = await Admin.create({
    name,
    email,
    password
  })

  if (admin) {
    sendSuccess(res, {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id)
    }, 'Admin registered successfully', 201)
  } else {
    sendError(res, 'Invalid admin data received', 400)
  }
})

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const admin = await Admin.findOne({ email })

  if (admin && (await admin.comparePassword(password))) {
    sendSuccess(res, {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id)
    }, 'Login successful')
  } else {
    sendError(res, 'Invalid email or password', 401)
  }
})

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private (Admin)
export const getAdminProfile = asyncHandler(async (req, res) => {
  if (req.admin) {
    sendSuccess(res, req.admin, 'Profile fetched successfully')
  } else {
    sendError(res, 'Admin profile not found', 404)
  }
})

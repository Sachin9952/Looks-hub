import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendError } from '../utils/responseHandler.js'

export const protectAdmin = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      req.admin = await Admin.findById(decoded.id).select('-password')
      if (!req.admin) {
        return sendError(res, 'Not authorized, admin not found', 401)
      }
      next()
    } catch (error) {
      console.error('JWT verification error:', error)
      return sendError(res, 'Not authorized, token invalid or expired', 401)
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token provided', 401)
  }
})

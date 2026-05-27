import { sendError } from '../utils/responseHandler.js'

export const errorHandler = (err, req, res, next) => {
  console.error('Centralized Error Handler caught:', err)
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  const message = err.message || 'Internal Server Error'
  
  const errors = process.env.NODE_ENV === 'development' ? err.stack : null
  
  sendError(res, message, statusCode, errors)
}

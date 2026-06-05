const rateLimitMap = new Map()

export const lookupRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const now = Date.now()

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [])
  }

  const timestamps = rateLimitMap.get(ip)
  const oneMinuteAgo = now - 60000
  const recentTimestamps = timestamps.filter((t) => t > oneMinuteAgo)

  if (recentTimestamps.length >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many lookup attempts. Please try again after a minute.'
    })
  }

  recentTimestamps.push(now)
  rateLimitMap.set(ip, recentTimestamps)
  next()
}

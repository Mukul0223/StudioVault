import 'dotenv/config'

const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  
  const token = authHeader.split(' ')[1]
  
  if (token === process.env.ADMIN_SECRET_KEY) {
    next()
  }
  else {
    return res.status(403).json({ message: "Unauthorized" })
  }
}

export default adminAuth
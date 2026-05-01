const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'azis_secret_key'

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado' })
  }
}

// Controle por nome de role — mantido para legibilidade
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' })
  }
  next()
}

// Controle por nível numérico — novo, para comparações de hierarquia
// Uso: requireLevel(2) = permite nivel >= 2 (gestor e admin)
const requireLevel = (minLevel) => (req, res, next) => {
  if (!req.user || req.user.nivel < minLevel) {
    return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' })
  }
  next()
}

module.exports = { verifyToken, requireRole, requireLevel }

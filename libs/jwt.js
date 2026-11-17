const jwt = require('jsonwebtoken')

// Crea el token de la sesión con el id y el rol del usuario.
// La clave secreta está en el .env, no quemada en el código.
function crearToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  })
}

module.exports = { crearToken }

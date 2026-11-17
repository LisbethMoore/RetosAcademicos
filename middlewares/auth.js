const jwt = require('jsonwebtoken')

// Verifica que haya una sesión iniciada: lee el token de la cookie y deja en req.user
// el id y el rol del usuario. Así el backend sabe quién hace la petición sin que el
// frontend tenga que mandar el usuario (sin datos quemados).
function authRequired(req, res, next) {
  const { token } = req.cookies

  if (!token) {
    return res.status(401).send({message: "Debes iniciar sesión"})
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, usuario) => {  //03
    if (err) return res.status(401).send({message: "La sesión no es válida o ya expiró, inicia sesión de nuevo"})
    req.user = usuario
    next()
  })
}

// Solo deja pasar al rol indicado (se usa despues de authRequired)
function soloRol(rol) {
  return (req, res, next) => {
    if (req.user.rol !== rol) {
      return res.status(403).send({message: `Solo un ${rol} puede hacer esta acción`})
    }
    next()
  }
}

module.exports = { authRequired, soloRol }

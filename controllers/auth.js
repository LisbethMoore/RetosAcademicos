const bcrypt = require('bcryptjs')
let Usuario = require('../models/usuario')
const { crearToken } = require('../libs/jwt')

const nivelesAcademicos = ['Primaria', 'Secundaria', 'Universitario']

// La sesión viaja en una cookie httpOnly: el JavaScript del navegador no la puede leer.
// En Render el frontend y la API quedan en dominios distintos, por eso en producción la cookie
// necesita sameSite 'none' (para que viaje entre los dos) y secure (solo por HTTPS).
const enProduccion = process.env.NODE_ENV === 'production'
const opcionesCookie = {
  httpOnly: true,
  sameSite: enProduccion ? 'none' : 'lax',
  secure: enProduccion,
  maxAge: 24 * 60 * 60 * 1000
}

// Lo que se devuelve del usuario: nunca la contraseña
function datosPublicos(usuario) {
  return {
    id: usuario._id,
    nombre: usuario.nombre,
    usuario: usuario.usuario,
    rol: usuario.rol,
    nivelAcademico: usuario.nivelAcademico
  }
}

const controller = {
  // Funcionalidad 1: registro rápido del jugador (nombre, usuario, contraseña y nivel)
  registro: async function (req, res) {
    try {
      const { nombre, usuario, contrasena, nivelAcademico } = req.body

      //validar los datos obligatorios
      if (!(nombre && nombre.trim() && usuario && usuario.trim() && contrasena && nivelAcademico)) {
        return res.status(400).send({message: "Datos incompletos: nombre, usuario, contrasena y nivelAcademico son obligatorios"})
      }

      //el nombre de usuario sin espacios, para poder escribirlo al iniciar sesión
      const nombreUsuario = usuario.trim().toLowerCase()
      if (/\s/.test(nombreUsuario)) {
        return res.status(400).send({message: "El usuario no puede tener espacios"})
      }

      if (contrasena.length < 4) {
        return res.status(400).send({message: "La contraseña debe tener al menos 4 caracteres"})
      }

      //el nivel académico define los retos que le salen
      if (!nivelesAcademicos.includes(nivelAcademico)) {
        return res.status(400).send({message: "El nivelAcademico debe ser 'Primaria', 'Secundaria' o 'Universitario'"})
      }

      //validar que el usuario no exista
      const existente = await Usuario.findOne({ usuario: nombreUsuario })
      if (existente) {
        return res.status(400).send({message: "Ese usuario ya existe, escoge otro"})
      }

      //la contraseña se guarda cifrada (hash), no en texto plano
      let nuevo = new Usuario()
      nuevo.nombre = nombre.trim()
      nuevo.usuario = nombreUsuario
      nuevo.contrasena = await bcrypt.hash(contrasena, 10) //01
      nuevo.rol = 'jugador'   // desde el registro solo se crean jugadores
      nuevo.nivelAcademico = nivelAcademico

      const guardado = await nuevo.save()

      //queda con la sesión iniciada
      const token = await crearToken({ id: guardado._id, rol: guardado.rol })
      res.cookie('token', token, opcionesCookie)
      return res.status(201).json({ usuario: datosPublicos(guardado) })
    } catch (err) {
      return res.status(500).send({message: `Error al registrar el usuario: ${err}`})
    }
  },

  // Iniciar sesión con usuario y contraseña
  login: async function (req, res) {
    try {
      const { usuario, contrasena } = req.body

      if (!(usuario && contrasena)) {
        return res.status(400).send({message: "Escribe tu usuario y tu contraseña"})
      }

      //se busca en la base de datos, no hay usuarios quemados en el código
      const encontrado = await Usuario.findOne({ usuario: usuario.trim().toLowerCase() })
      //mismo mensaje en los dos casos, para no revelar si el usuario existe
      if (!encontrado || !(await bcrypt.compare(contrasena, encontrado.contrasena || ''))) {  //01
        return res.status(400).send({message: "Usuario o contraseña incorrectos"})
      }

      const token = await crearToken({ id: encontrado._id, rol: encontrado.rol }) //02
      res.cookie('token', token, opcionesCookie)
      return res.status(200).json({ usuario: datosPublicos(encontrado) })
    } catch (err) {
      return res.status(500).send({message: `Error al iniciar sesión: ${err}`})
    }
  },

  // Cerrar sesión: se borra la cookie
  logout: function (req, res) {
    res.clearCookie('token', { httpOnly: true, sameSite: opcionesCookie.sameSite, secure: opcionesCookie.secure })
    return res.status(200).json({ message: "Sesión cerrada" })
  },

  // Datos del usuario que tiene la sesión iniciada (el frontend lo usa al recargar la página)
  perfil: async function (req, res) {
    try {
      const usuario = await Usuario.findById(req.user.id)
      if (!usuario) return res.status(401).send({message: "El usuario de la sesión ya no existe"})
      return res.status(200).json({ usuario: datosPublicos(usuario) })
    } catch (err) {
      return res.status(500).send({message: `Error al consultar el perfil: ${err}`})
    }
  }
}

module.exports = controller

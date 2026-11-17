const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const auth_routes = require('./routes/auth')
const retos_routes = require('./routes/retos')
const partidas_routes = require('./routes/partidas')
const respuestas_routes = require('./routes/respuestas')
const estadisticas_routes = require('./routes/estadisticas')

const app = express()

app.set('port', process.env.PORT || 3000)
// En Render la API está detrás de un proxy (HTTPS); esto permite que funcionen las cookies secure
app.set('trust proxy', 1)

// CORS: solo se aceptan peticiones del frontend registrado (el "servidor original"),
// no de cualquier aplicación. credentials permite que viaje la cookie de la sesión.
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
// el límite se sube a 1 MB porque los retos pueden traer su imagen
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use('/api/auth', auth_routes)
app.use('/api/retos', retos_routes)
app.use('/api/partidas', partidas_routes)
app.use('/api/respuestas', respuestas_routes)
app.use('/api/estadisticas', estadisticas_routes)

// ruta no encontrada
app.use((req, res) => {
  res.status(404).send({message: "Ruta no encontrada"})
})

// manejo de errores
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).send({message: "El cuerpo de la petición no es un JSON válido"})
  }
  return res.status(500).send({message: "Error interno del servidor"})
})

module.exports = app

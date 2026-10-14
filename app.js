const express = require('express')
const usuarios_routes = require('./routes/usuarios')
const retos_routes = require('./routes/retos')
const partidas_routes = require('./routes/partidas')  
const respuestas_routes = require('./routes/respuestas')
const estadisticas_routes = require('./routes/estadisticas')

const app = express()

app.set('port', process.env.PORT || 3000)

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/api/usuarios', usuarios_routes)
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
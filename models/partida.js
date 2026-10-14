let mongoose = require('mongoose')
let Schema = mongoose.Schema

let PartidaSchema = Schema({
  usuarioId: Schema.Types.ObjectId,
  puntuacion: Number,
  tiempoTotal: Number,
  totalPreguntas: Number,
  aciertos: Number,
  errores: Number,
  porcentajeAciertos: Number
})

module.exports = mongoose.model('Partida', PartidaSchema, 'partidas')
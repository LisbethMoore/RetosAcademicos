let mongoose = require('mongoose')
let Schema = mongoose.Schema

let RespuestaSchema = Schema({
  partidaId: Schema.Types.ObjectId,
  usuarioId: Schema.Types.ObjectId,
  retoId: Schema.Types.ObjectId,
  respuesta: String,
  correcta: Boolean,
  tiempoRespuesta: Number,
  puntuacion: Number,
  fecha: Date          // cuando el jugador respondió (la pone el backend)
})

module.exports = mongoose.model('Respuesta', RespuestaSchema, 'respuestas')
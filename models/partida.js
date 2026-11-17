let mongoose = require('mongoose')
let Schema = mongoose.Schema

let PartidaSchema = Schema({
  usuarioId: Schema.Types.ObjectId,
  puntuacion: Number,
  tiempoTotal: Number,
  totalPreguntas: Number,
  aciertos: Number,
  errores: Number,
  porcentajeAciertos: Number,
  retosAsignados: [Schema.Types.ObjectId],
  // Las fechas las pone siempre el backend (en UTC), nunca el navegador,
  // para que coincidan aunque el frontend y la API estén en servidores distintos
  fechaInicio: Date,   // cuando el jugador empieza la partida
  fechaFin: Date       // la misma fecha de la última respuesta (queda vacía si no la termina)
})

module.exports = mongoose.model('Partida', PartidaSchema, 'partidas')
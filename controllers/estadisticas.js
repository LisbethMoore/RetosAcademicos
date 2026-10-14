let Partida = require('../models/partida')
let Respuesta = require('../models/respuesta')

const controller = {
  // Funcionalidad 9: reporte de desempeño de los jugadores
  getDesempenoJugadores: function (req, res) {
    const limite = req.query.limite

    //validar el límite opcional: limite=3 muestra solo los 3 primeros
    if (limite !== undefined && (!Number.isInteger(Number(limite)) || Number(limite) <= 0)) {
      return res.status(400).send({message: "El limite debe ser un número entero mayor que 0"})
    }

    let pipeline = [
      //1. solo partidas que tengan al menos una respuesta
      { $match: { $or: [ { aciertos: { $gt: 0 } }, { errores: { $gt: 0 } } ] } },
      //2. agrupar por jugador y calcular sus indicadores
      { $group: {
          _id: '$usuarioId',
          totalPartidas: { $sum: 1 },
          puntuacionTotal: { $sum: '$puntuacion' },
          puntuacionPromedio: { $avg: '$puntuacion' },
          mejorPuntuacion: { $max: '$puntuacion' },
          totalAciertos: { $sum: '$aciertos' },
          totalErrores: { $sum: '$errores' },
          porcentajePromedio: { $avg: '$porcentajeAciertos' },
          tiempoPromedio: { $avg: '$tiempoTotal' }
      } },
      //3. unir con usuarios para mostrar el nombre del jugador
      { $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario'
      } },
      { $unwind: '$usuario' },
      //4. mostrar campos claros y redondear los promedios
      { $project: {
          _id: 0,
          usuarioId: '$_id',
          jugador: '$usuario.nombre',
          totalPartidas: 1,
          puntuacionTotal: 1,
          puntuacionPromedio: { $round: ['$puntuacionPromedio', 2] },
          mejorPuntuacion: 1,
          totalAciertos: 1,
          totalErrores: 1,
          porcentajePromedio: { $round: ['$porcentajePromedio', 2] },
          tiempoPromedio: { $round: ['$tiempoPromedio', 2] }
      } },
      //5. ranking: de mayor a menor puntuación total
      { $sort: { puntuacionTotal: -1, porcentajePromedio: -1 } }
    ]

    //6. si envían un límite, se agrega la etapa $limit
    if (limite !== undefined) {
      pipeline.push({ $limit: Number(limite) })
    }

    Partida.aggregate(pipeline)
      .then(jugadores => res.status(200).json({totalJugadores: jugadores.length, jugadores: jugadores}))
      .catch(err => res.status(500).send({message: `Error al generar el reporte: ${err}`}))
  },

  // Funcionalidad 10: retos con mayor porcentaje de error
  getRetosDificiles: function (req, res) {
    const limite = req.query.limite

    //validar el límite opcional: limite=3 muestra solo los 3 más difíciles
    if (limite !== undefined && (!Number.isInteger(Number(limite)) || Number(limite) <= 0)) {
      return res.status(400).send({message: "El limite debe ser un número entero mayor que 0"})
    }

    let pipeline = [
      //1. agrupar las respuestas por reto
      { $group: {
          _id: '$retoId',
          intentos: { $sum: 1 },
          //$cond funciona como un if: si correcta es true suma 0, si es false suma 1
          errores: { $sum: { $cond: ['$correcta', 0, 1] } },
          tiempoPromedio: { $avg: '$tiempoRespuesta' }
      } },
      //2. unir con retos para mostrar el título y el nivel
      { $lookup: {
          from: 'retos',
          localField: '_id',
          foreignField: '_id',
          as: 'reto'
      } },
      { $unwind: '$reto' },
      //3. calcular aciertos y porcentaje de error
      { $project: {
          _id: 0,
          retoId: '$_id',
          titulo: '$reto.contenido.titulo',
          nivel: '$reto.clasificacion.nivel',
          intentos: 1,
          errores: 1,
          aciertos: { $subtract: ['$intentos', '$errores'] },
          porcentajeError: { $round: [ { $multiply: [ { $divide: ['$errores', '$intentos'] }, 100 ] }, 2 ] },
          tiempoPromedio: { $round: ['$tiempoPromedio', 2] }
      } },
      //4. primero los retos con más error
      { $sort: { porcentajeError: -1, intentos: -1 } }
    ]

    //5. si envían un límite, se agrega la etapa $limit
    if (limite !== undefined) {
      pipeline.push({ $limit: Number(limite) })
    }

    Respuesta.aggregate(pipeline)
      .then(retos => res.status(200).json({totalRetos: retos.length, retos: retos}))
      .catch(err => res.status(500).send({message: `Error al generar el reporte: ${err}`}))
  }
}

module.exports = controller

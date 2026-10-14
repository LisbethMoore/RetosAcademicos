let mongoose = require('mongoose')
let Respuesta = require('../models/respuesta')
let Partida = require('../models/partida')
let Reto = require('../models/reto')
let Usuario = require('../models/usuario')

const puntosPorAcierto = 10

const controller = {
  // Funcionalidad 6: responder un reto dentro de una partida
  saveRespuesta: function (req, res) {
    const {partidaId, retoId, respuesta, tiempoRespuesta} = req.body

    //validar el formato de los ids
    if (!mongoose.Types.ObjectId.isValid(partidaId) || !mongoose.Types.ObjectId.isValid(retoId)) {
      return res.status(400).send({message: "partidaId o retoId no son válidos"})
    }

    //validar la respuesta y el tiempo
    if (!respuesta || typeof tiempoRespuesta !== 'number' || tiempoRespuesta <= 0) {
      return res.status(400).send({message: "Datos incompletos: respuesta es obligatoria y tiempoRespuesta debe ser un número mayor que 0"})
    }

    Partida.findById(partidaId).exec()
      .then(partida => {
        //validar que la partida exista
        if (!partida) return res.status(404).send({message: "La partida no existe"})

        //validar que la partida no haya terminado
        if (partida.aciertos + partida.errores >= partida.totalPreguntas) {
          return res.status(400).send({message: "La partida ya terminó, no se pueden registrar más respuestas"})
        }

        return Reto.findById(retoId).exec()
          .then(reto => {
            //validar que el reto exista y esté activo
            if (!reto) return res.status(404).send({message: "El reto no existe"})
            if (!reto.clasificacion.activo) return res.status(400).send({message: "El reto no está activo"})

            //validar que la respuesta sea una de las opciones del reto
            if (!reto.respuesta.opciones.includes(respuesta)) {
              return res.status(400).send({message: `La respuesta debe ser una de las opciones: ${reto.respuesta.opciones.join(', ')}`})
            }

            //validar que el reto no se haya respondido ya en esta partida
            return Respuesta.findOne({partidaId: partidaId, retoId: retoId}).exec()
              .then(respuestaExistente => {
                if (respuestaExistente) {
                  return res.status(400).send({message: "Este reto ya fue respondido en esta partida"})
                }

                //la API califica comparando con la respuesta correcta del reto
                const correcta = respuesta === reto.respuesta.respuestaCorrecta
                const puntos = correcta ? puntosPorAcierto : 0

                let nuevaRespuesta = new Respuesta()
                nuevaRespuesta.partidaId = partidaId
                nuevaRespuesta.usuarioId = partida.usuarioId
                nuevaRespuesta.retoId = retoId
                nuevaRespuesta.respuesta = respuesta
                nuevaRespuesta.correcta = correcta
                nuevaRespuesta.tiempoRespuesta = tiempoRespuesta
                nuevaRespuesta.puntuacion = puntos

                return nuevaRespuesta.save()
                  .then(respuestaGuardada => {
                    //1. actualizar los contadores con $inc (operación atómica)
                    return Partida.findByIdAndUpdate(partidaId, {
                      $inc: {
                        puntuacion: puntos,
                        aciertos: correcta ? 1 : 0,
                        errores: correcta ? 0 : 1,
                        tiempoTotal: tiempoRespuesta
                      }
                    })
                      //2. MongoDB recalcula el porcentaje con los valores ya guardados
                      .then(() => Partida.findByIdAndUpdate(partidaId, [
                        {
                          $set: {
                            porcentajeAciertos: {
                              $round: [
                                {$multiply: [{$divide: ['$aciertos', {$add: ['$aciertos', '$errores']}]}, 100]},
                                2
                              ]
                            }
                          }
                        }
                      ], {returnDocument: 'after', updatePipeline: true}))
                      .then(partidaActualizada => res.status(201).json({
                        correcta: correcta,
                        retroalimentacion: correcta ? reto.retroalimentacion.retroAcierto : reto.retroalimentacion.retroError,
                        respuesta: respuestaGuardada,
                        partida: partidaActualizada
                      }))
                  })
              })
          })
      })
      .catch(err => res.status(500).send({message: `Error al registrar la respuesta: ${err}`}))
  },

  // Funcionalidad 8: historial de respuestas de un jugador con el título del reto
  getRespuestasByUsuario: function (req, res) {
    const usuarioId = req.params.usuarioId
    const correcta = req.query.correcta

    //validar el formato del id
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).send({message: "El usuarioId no es válido"})
    }

    //en aggregate el id se debe convertir a ObjectId
    let filtro = { usuarioId: new mongoose.Types.ObjectId(usuarioId) }

    //filtro opcional: ?correcta=true o ?correcta=false
    if (correcta !== undefined) {
      if (correcta !== 'true' && correcta !== 'false') {
        return res.status(400).send({message: "El filtro correcta debe ser 'true' o 'false'"})
      }
      filtro.correcta = correcta === 'true'
    }

    Usuario.findById(usuarioId).exec()
      .then(usuario => {
        //validar que el usuario exista
        if (!usuario) return res.status(404).send({message: "El usuario no existe"})

        return Respuesta.aggregate([
          //1. respuestas del usuario (y opcionalmente solo aciertos o solo errores)
          { $match: filtro },
          //2. unir cada respuesta con su reto
          { $lookup: {
              from: 'retos',
              localField: 'retoId',
              foreignField: '_id',
              as: 'reto'
          } },
          //3. $lookup devuelve un arreglo, $unwind lo convierte en un objeto
          { $unwind: '$reto' },
          //4. de la más reciente a la más antigua
          { $sort: { _id: -1 } },
          //5. mostrar solo los campos útiles
          { $project: {
              _id: 0,
              partidaId: 1,
              reto: '$reto.contenido.titulo',
              nivel: '$reto.clasificacion.nivel',
              respuesta: 1,
              respuestaCorrecta: '$reto.respuesta.respuestaCorrecta',
              correcta: 1,
              tiempoRespuesta: 1,
              puntuacion: 1
          } }
        ])
          .then(respuestas => res.status(200).json({
            usuario: usuario.nombre,
            totalRespuestas: respuestas.length,
            respuestas: respuestas
          }))
      })
      .catch(err => res.status(500).send({message: `Error al consultar las respuestas: ${err}`}))
  }
}

module.exports = controller
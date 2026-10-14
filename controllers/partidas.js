let mongoose = require('mongoose')
let Partida = require('../models/partida')
let Usuario = require('../models/usuario')
let Reto = require('../models/reto')

const controller = {
  // Funcionalidad 5: iniciar una partida
  savePartida: function (req, res) {
    const {usuarioId, totalPreguntas} = req.body

    //validar el formato del id del usuario
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).send({message: "El usuarioId no es válido"})
    }

    //validar que totalPreguntas sea un entero mayor que 0
    if (!Number.isInteger(totalPreguntas) || totalPreguntas <= 0) {
      return res.status(400).send({message: "totalPreguntas debe ser un número entero mayor que 0"})
    }

    Usuario.findById(usuarioId).exec()
      .then(usuario => {
        //validar que el usuario exista
        if (!usuario) return res.status(404).send({message: "El usuario no existe"})

        //validar que sea jugador
        if (usuario.rol !== 'jugador') {
          return res.status(400).send({message: "Solo los usuarios con rol jugador pueden iniciar partidas"})
        }

        //validar que haya suficientes retos activos
        return Reto.countDocuments({'clasificacion.activo': true}).exec()
          .then(retosActivos => {
            if (totalPreguntas > retosActivos) {
              return res.status(400).send({message: `Solo hay ${retosActivos} retos activos, no se pueden pedir ${totalPreguntas} preguntas`})
            }

            //la partida inicia con todos los indicadores en 0
            let partida = new Partida()
            partida.usuarioId = usuarioId
            partida.puntuacion = 0
            partida.tiempoTotal = 0
            partida.totalPreguntas = totalPreguntas
            partida.aciertos = 0
            partida.errores = 0
            partida.porcentajeAciertos = 0

            return partida.save()
              .then(partidaGuardada => res.status(201).json({partida: partidaGuardada}))
          })
      })
      .catch(err => res.status(500).send({message: `Error al iniciar la partida: ${err}`}))
  },

  // Funcionalidad 7: historial de partidas de un jugador
  getPartidasByUsuario: function (req, res) {
    const usuarioId = req.params.usuarioId

    //validar el formato del id
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).send({message: "El usuarioId no es válido"})
    }

    Usuario.findById(usuarioId).exec()
      .then(usuario => {
        //validar que el usuario exista
        if (!usuario) return res.status(404).send({message: "El usuario no existe"})

        //partidas del usuario, de la más reciente a la más antigua
        return Partida.find({usuarioId: usuarioId}).sort({_id: -1}).exec()
          .then(partidas => res.status(200).json({
            usuario: usuario.nombre,
            totalPartidas: partidas.length,
            partidas: partidas
          }))
      })
      .catch(err => res.status(500).send({message: `Error al consultar el historial: ${err}`}))
  }
}

module.exports = controller
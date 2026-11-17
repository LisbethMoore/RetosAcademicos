let mongoose = require('mongoose')
let Partida = require('../models/partida')
let Usuario = require('../models/usuario')
let Reto = require('../models/reto')

// Cada nivel académico del jugador corresponde a un nivel de los retos
const nivelPorNivelAcademico = {
  'Primaria': 'Básico',
  'Secundaria': 'Intermedio',
  'Universitario': 'Avanzado'
}

// Mezcla un arreglo (Fisher-Yates) para que las opciones no salgan siempre en el mismo orden
function mezclar(arreglo) {
  const copia = [...arreglo]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temporal = copia[i]
    copia[i] = copia[j]
    copia[j] = temporal
  }
  return copia
}

const controller = {

  // Funcionalidad 5: iniciar una partida
  savePartida: async function (req, res) {
    try {

      // El jugador sale de la sesión (token), no se manda en el body
      const usuarioId = req.user.id
      const { totalPreguntas = 6 } = req.body

      // Validar que totalPreguntas sea un entero mayor que 0
      if (
        !Number.isInteger(totalPreguntas) ||
        totalPreguntas <= 0
      ) {
        return res.status(400).send({
          message: "totalPreguntas debe ser un número entero mayor que 0"
        })
      }

      // Buscar usuario
      const usuario = await Usuario.findById(usuarioId)

      // Validar que el usuario exista
      if (!usuario) {
        return res.status(404).send({
          message: "El usuario no existe"
        })
      }

      // Validar que sea jugador
      if (usuario.rol !== 'jugador') {
        return res.status(400).send({
          message: "Solo los usuarios con rol jugador pueden iniciar partidas"
        })
      }

      // Pasar el nivel académico del jugador al nivel de los retos
      const nivel = nivelPorNivelAcademico[usuario.nivelAcademico]
      if (!nivel) {
        return res.status(400).send({
          message: "El nivel académico del jugador debe ser 'Primaria', 'Secundaria' o 'Universitario'"
        })
      }

      // Buscar retos activos del nivel del jugador
      const retos = await Reto.aggregate([
        {
          $match: {
            'clasificacion.activo': true,
            'clasificacion.nivel': nivel
          }
        },

        // Seleccionar retos aleatoriamente
        {
          $sample: {
            size: totalPreguntas
          }
        },

        // Ocultar información que el estudiante no debe recibir
        {
          $project: {
            'respuesta.indiceCorrecto': 0,
            'respuesta.respuestaCorrecta': 0,
            retroalimentacion: 0
          }
        }
      ])

      // Comprobar que haya suficientes retos
      if (retos.length < totalPreguntas) {
        return res.status(400).send({
          message: `Solo hay ${retos.length} retos activos de nivel ${nivel}, no se pueden pedir ${totalPreguntas} preguntas`
        })
      }

      // Mezclar las opciones de cada reto; la respuesta se califica por el texto, no por la posición
      retos.forEach(reto => {
        reto.respuesta.opciones = mezclar(reto.respuesta.opciones)
      })

      // Obtener los IDs de los retos seleccionados
      const retosAsignados = retos.map(reto => reto._id)

      // Crear la partida
      let partida = new Partida()

      partida.usuarioId = usuarioId
      partida.puntuacion = 0
      partida.tiempoTotal = 0
      partida.totalPreguntas = totalPreguntas
      partida.aciertos = 0
      partida.errores = 0
      partida.porcentajeAciertos = 0

      // Guardar los retos seleccionados para esta partida
      partida.retosAsignados = retosAsignados

      // La fecha la pone el servidor, no el navegador
      partida.fechaInicio = new Date()

      // Guardar partida
      const partidaGuardada = await partida.save()

      // Devolver la partida junto con los retos seleccionados
      return res.status(201).json({
        partida: partidaGuardada,
        retos: retos
      })

    } catch (err) {

      return res.status(500).send({
        message: `Error al iniciar la partida: ${err}`
      })

    }
  },


  // Funcionalidad 7: historial de partidas del jugador que tiene la sesión iniciada
  getMisPartidas: function (req, res) {
    return historialPartidas(req.user.id, res)
  },

  // Funcionalidad 7 (administrador): historial de partidas de cualquier jugador
  getPartidasByUsuario: function (req, res) {

    const usuarioId = req.params.usuarioId

    // Validar el formato del ID
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).send({
        message: "El usuarioId no es válido"
      })
    }

    return historialPartidas(usuarioId, res)
  }
}

// Partidas de un usuario, de la más reciente a la más antigua
function historialPartidas(usuarioId, res) {
    return Usuario.findById(usuarioId).exec()
      .then(usuario => {

        // Validar que el usuario exista
        if (!usuario) {
          return res.status(404).send({
            message: "El usuario no existe"
          })
        }

        // Partidas del usuario, de la más reciente a la más antigua
        return Partida.find({
          usuarioId: usuarioId
        })
          .sort({ _id: -1 })
          .exec()
          .then(partidas => res.status(200).json({
            usuario: usuario.nombre,
            totalPartidas: partidas.length,
            partidas: partidas
          }))
      })

      .catch(err =>
        res.status(500).send({
          message: `Error al consultar el historial: ${err}`
        })
      )
}

module.exports = controller
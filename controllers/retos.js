let mongoose = require('mongoose') 
let Reto = require('../models/reto')

const nivelesValidos = ['Básico', 'Intermedio', 'Avanzado']

const controller = {
  // Funcionalidad 3: filtrar retos activos por nivel
  getRetos: function (req, res) {
    const nivel = req.query.nivel

    //solo retos activos
    let filtro = { 'clasificacion.activo': true }

    //si envían un nivel, se valida y se agrega al filtro
    if (nivel) {
      if (!nivelesValidos.includes(nivel)) {
        return res.status(400).send({message: "El nivel debe ser 'Básico', 'Intermedio' o 'Avanzado'"})
      }
      filtro['clasificacion.nivel'] = nivel
    }

    //se ocultan la respuesta correcta y la retroalimentación para que el jugador no las vea
    const proyeccion = {
      'respuesta.indiceCorrecto': 0,
      'respuesta.respuestaCorrecta': 0,
      retroalimentacion: 0
    }

    Reto.find(filtro, proyeccion).exec()
      .then(retos => res.status(200).json({total: retos.length, retos: retos}))
      .catch(err => res.status(500).send({message: `Error al consultar los retos: ${err}`}))
  },

  // Funcionalidad 2: registrar un reto
  saveReto: function (req, res) {
    const {contenido, clasificacion, respuesta, retroalimentacion, configuracion} = req.body

    //validar que vengan todos los datos
    if (!(contenido && contenido.titulo && contenido.enunciado &&
          clasificacion && clasificacion.tipoDePregunta && clasificacion.nivel &&
          respuesta && respuesta.opciones && respuesta.indiceCorrecto !== undefined &&
          retroalimentacion && retroalimentacion.retroAcierto && retroalimentacion.retroError)) {
      return res.status(400).send({message: "Datos incompletos"})
    }

    //validar el nivel
    if (!nivelesValidos.includes(clasificacion.nivel)) {
      return res.status(400).send({message: "El nivel debe ser 'Básico', 'Intermedio' o 'Avanzado'"})
    }

    //validar que haya al menos 2 opciones
    if (!Array.isArray(respuesta.opciones) || respuesta.opciones.length < 2) {
      return res.status(400).send({message: "El reto debe tener al menos 2 opciones"})
    }

    //validar que el índice correcto exista dentro de las opciones
    if (!Number.isInteger(respuesta.indiceCorrecto) ||
        respuesta.indiceCorrecto < 0 ||
        respuesta.indiceCorrecto >= respuesta.opciones.length) {
      return res.status(400).send({message: `indiceCorrecto debe estar entre 0 y ${respuesta.opciones.length - 1}`})
    }

    let reto = new Reto()
    reto.contenido = {
      titulo: contenido.titulo,
      enunciado: contenido.enunciado
    }
    reto.clasificacion = {
      tipoDePregunta: clasificacion.tipoDePregunta,
      nivel: clasificacion.nivel,
      activo: true
    }
    reto.respuesta = {
      opciones: respuesta.opciones,
      indiceCorrecto: respuesta.indiceCorrecto,
      // La respuesta correcta se toma de las opciones, no se escribe a mano
      respuestaCorrecta: respuesta.opciones[respuesta.indiceCorrecto]
    }
    reto.retroalimentacion = {
      retroAcierto: retroalimentacion.retroAcierto,
      retroError: retroalimentacion.retroError
    }
    reto.configuracion = {
      tolerancia: configuracion && configuracion.tolerancia ? configuracion.tolerancia : 0
    }

    reto.save()
      .then(retoGuardado => res.status(201).json({reto: retoGuardado}))
      .catch(err => res.status(500).send({message: `Error al registrar el reto: ${err}`}))
  },

  //Funcionalidad 4: activar o desactivar un reto
  updateEstadoReto: function (req, res) {
    const retoId = req.params.id
    const activo = req.body.activo

    //validar que el id tenga formato de MongoDB
    if (!mongoose.Types.ObjectId.isValid(retoId)) {
      return res.status(400).send({message: "El id del reto no es válido"})
    }

    //validar que activo sea true o false
    if (typeof activo !== 'boolean') {
      return res.status(400).send({message: "El campo activo debe ser true o false"})
    }

    //solo se cambia el campo activo, el resto del reto se conserva
    Reto.findByIdAndUpdate(retoId, {$set: {'clasificacion.activo': activo}}, {returnDocument: 'after'})
      .then(retoActualizado => {
        if (!retoActualizado) return res.status(404).send({message: "El reto no existe"})
        return res.status(200).json({
          message: activo ? "Reto activado" : "Reto desactivado",
          reto: retoActualizado
        })
      })
      .catch(err => res.status(500).send({message: `Error al actualizar el reto: ${err}`}))
  }
}

module.exports = controller
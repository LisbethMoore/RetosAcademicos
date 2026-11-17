let mongoose = require('mongoose')
let Reto = require('../models/reto')
let Respuesta = require('../models/respuesta')

const nivelesValidos = ['Básico', 'Intermedio', 'Avanzado']

//revisa los datos de un reto (se usa al crear y al editar), devuelve el mensaje de error o null
function validarReto(body) {
  const {contenido, clasificacion, respuesta, retroalimentacion} = body

  //validar que vengan todos los datos
  if (!(contenido && contenido.titulo && contenido.enunciado &&
        clasificacion && clasificacion.tipoDePregunta && clasificacion.nivel &&
        respuesta && respuesta.opciones && respuesta.indiceCorrecto !== undefined &&
        retroalimentacion && retroalimentacion.retroAcierto && retroalimentacion.retroError)) {
    return "Datos incompletos"
  }

  //validar el nivel
  if (!nivelesValidos.includes(clasificacion.nivel)) {
    return "El nivel debe ser 'Básico', 'Intermedio' o 'Avanzado'"
  }

  //validar que haya al menos 2 opciones
  if (!Array.isArray(respuesta.opciones) || respuesta.opciones.length < 2) {
    return "El reto debe tener al menos 2 opciones"
  }

  //validar que el índice correcto exista dentro de las opciones
  if (!Number.isInteger(respuesta.indiceCorrecto) ||
      respuesta.indiceCorrecto < 0 ||
      respuesta.indiceCorrecto >= respuesta.opciones.length) {
    return `indiceCorrecto debe estar entre 0 y ${respuesta.opciones.length - 1}`
  }

  //la imagen es opcional. Llega como texto (data URL) desde el formulario, ya comprimida;
  //se guarda dentro del reto en MongoDB porque en Render los archivos subidos se borran
  if (contenido.imagen) {
    const esDataUrl = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(contenido.imagen)
    const esUrl = /^https?:\/\/\S+$/.test(contenido.imagen)
    if (!esDataUrl && !esUrl) {
      return "La imagen no es válida: debe ser un archivo JPG, PNG o WebP"
    }
    if (contenido.imagen.length > 500 * 1024) {
      return "La imagen es muy pesada (máximo unos 400 KB)"
    }
  }

  return null
}

//arma los campos del reto a partir del body (se usa al crear y al editar)
function datosReto(body, activo) {
  const {contenido, clasificacion, respuesta, retroalimentacion, configuracion} = body
  return {
    contenido: {
      titulo: contenido.titulo,
      enunciado: contenido.enunciado,
      imagen: contenido.imagen || ''
    },
    clasificacion: {
      tipoDePregunta: clasificacion.tipoDePregunta,
      nivel: clasificacion.nivel,
      activo: activo
    },
    respuesta: {
      opciones: respuesta.opciones,
      indiceCorrecto: respuesta.indiceCorrecto,
      // La respuesta correcta se toma de las opciones, no se escribe a mano
      respuestaCorrecta: respuesta.opciones[respuesta.indiceCorrecto]
    },
    retroalimentacion: {
      retroAcierto: retroalimentacion.retroAcierto,
      retroError: retroalimentacion.retroError
    },
    configuracion: {
      tolerancia: configuracion && configuracion.tolerancia ? configuracion.tolerancia : 0
    }
  }
}

const controller = {
  // Funcionalidad 3: filtrar retos activos por nivel
  getRetos: function (req, res) {
    const nivel = req.query.nivel
    //solo el administrador puede ver también los retos desactivados
    const todos = req.query.todos === 'true' && req.user.rol === 'administrador'

    //solo retos activos (el administrador puede pedir todos con ?todos=true)
    let filtro = todos ? {} : { 'clasificacion.activo': true }

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

  // CRUD: consultar un reto completo por su id (para editarlo)
  getReto: function (req, res) {
    const retoId = req.params.id

    //validar que el id tenga formato de MongoDB
    if (!mongoose.Types.ObjectId.isValid(retoId)) {
      return res.status(400).send({message: "El id del reto no es válido"})
    }

    Reto.findById(retoId).exec()
      .then(reto => {
        if (!reto) return res.status(404).send({message: "El reto no existe"})
        return res.status(200).json({reto: reto})
      })
      .catch(err => res.status(500).send({message: `Error al consultar el reto: ${err}`}))
  },

  // Funcionalidad 2: registrar un reto
  saveReto: function (req, res) {
    const error = validarReto(req.body)
    if (error) return res.status(400).send({message: error})

    //todo reto nuevo queda activo
    let reto = new Reto(datosReto(req.body, true))

    reto.save()
      .then(retoGuardado => res.status(201).json({reto: retoGuardado}))
      .catch(err => res.status(500).send({message: `Error al registrar el reto: ${err}`}))
  },

  // CRUD: editar todos los datos de un reto
  updateReto: function (req, res) {
    const retoId = req.params.id

    //validar que el id tenga formato de MongoDB
    if (!mongoose.Types.ObjectId.isValid(retoId)) {
      return res.status(400).send({message: "El id del reto no es válido"})
    }

    const error = validarReto(req.body)
    if (error) return res.status(400).send({message: error})

    Reto.findById(retoId).exec()
      .then(reto => {
        if (!reto) return res.status(404).send({message: "El reto no existe"})

        //si no envían activo, se conserva el estado que tenía
        const activo = typeof req.body.clasificacion.activo === 'boolean'
          ? req.body.clasificacion.activo
          : reto.clasificacion.activo

        return Reto.findByIdAndUpdate(retoId, {$set: datosReto(req.body, activo)}, {returnDocument: 'after'})
          .then(retoActualizado => res.status(200).json({reto: retoActualizado}))
      })
      .catch(err => res.status(500).send({message: `Error al actualizar el reto: ${err}`}))
  },

  // CRUD: eliminar un reto (solo si nadie lo ha respondido)
  deleteReto: function (req, res) {
    const retoId = req.params.id

    //validar que el id tenga formato de MongoDB
    if (!mongoose.Types.ObjectId.isValid(retoId)) {
      return res.status(400).send({message: "El id del reto no es válido"})
    }

    Reto.findById(retoId).exec()
      .then(reto => {
        if (!reto) return res.status(404).send({message: "El reto no existe"})

        //si ya tiene respuestas no se borra, para no dañar el historial ni las estadísticas
        return Respuesta.countDocuments({retoId: retoId}).exec()
          .then(totalRespuestas => {
            if (totalRespuestas > 0) {
              return res.status(400).send({message: `El reto ya tiene ${totalRespuestas} respuestas, no se puede eliminar. Desactívalo en su lugar`})
            }

            return Reto.findByIdAndDelete(retoId)
              .then(() => res.status(200).json({message: "Reto eliminado", reto: reto}))
          })
      })
      .catch(err => res.status(500).send({message: `Error al eliminar el reto: ${err}`}))
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

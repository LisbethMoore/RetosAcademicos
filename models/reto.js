let mongoose = require('mongoose')
let Schema = mongoose.Schema

let RetoSchema = Schema({
  contenido: {
    titulo: String,
    enunciado: String
  },
  clasificacion: {
    tipoDePregunta: String,
    nivel: String,
    activo: Boolean
  },
  respuesta: {
    opciones: [String],
    indiceCorrecto: Number,
    respuestaCorrecta: String
  },
  retroalimentacion: {
    retroAcierto: String,
    retroError: String
  },
  configuracion: {
    tolerancia: Number
  }
})

module.exports = mongoose.model('Reto', RetoSchema, 'retos')
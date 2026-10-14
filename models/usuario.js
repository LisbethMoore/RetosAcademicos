let mongoose = require('mongoose')
let Schema = mongoose.Schema

let UsuarioSchema = Schema({
  nombre: String,
  email: String,
  contrasena: String,
  rol: String,
  institucion: String,
  nivelAcademico: String
})

module.exports = mongoose.model('Usuario', UsuarioSchema, 'usuarios')
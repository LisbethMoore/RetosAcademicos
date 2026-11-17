let mongoose = require('mongoose')
let Schema = mongoose.Schema

let UsuarioSchema = Schema({
  nombre: String,
  usuario: { type: String, unique: true },   // con este nombre de usuario se inicia sesión
  contrasena: String,                        // se guarda cifrada con bcrypt, nunca en texto plano
  rol: String,
  institucion: String,
  nivelAcademico: String
})

module.exports = mongoose.model('Usuario', UsuarioSchema, 'usuarios')

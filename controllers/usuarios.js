let Usuario = require('../models/usuario')

const controller = {
  //registrar un usuario
  saveUsuario: function (req, res) {
    const {nombre, email, contrasena, rol, institucion, nivelAcademico} = req.body

    // 1. Validar que vengan todos los datos
    if (!(nombre && email && contrasena && rol && institucion && nivelAcademico)) {
      return res.status(400).send({message: "Datos incompletos: nombre, email, contrasena, rol, institucion y nivelAcademico son obligatorios"})
    }

    //valida que el rol sea uno de los permitidos
    if (rol !== 'jugador' && rol !== 'administrador') {
      return res.status(400).send({message: "El rol debe ser 'jugador' o 'administrador'"})
    }

    //validar que el email no este registrado
    Usuario.findOne({email: email}).exec()
      .then(usuarioExistente => {
        if (usuarioExistente) {
          return res.status(400).send({message: "El email ya está registrado"})
        }

        //guarda el usuario
        let usuario = new Usuario()
        usuario.nombre = nombre
        usuario.email = email
        usuario.contrasena = contrasena
        usuario.rol = rol
        usuario.institucion = institucion
        usuario.nivelAcademico = nivelAcademico

        return usuario.save()
          .then(usuarioGuardado => res.status(201).json({usuario: usuarioGuardado}))
      })
      .catch(err => res.status(500).send({message: `Error al registrar el usuario: ${err}`}))
  }
}

module.exports = controller
const { Router } = require('express')

const UsuarioController = require('../controllers/usuarios')

const router = Router()

router.post('/', UsuarioController.saveUsuario)

module.exports = router
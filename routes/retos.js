const { Router } = require('express')

const RetoController = require('../controllers/retos')
const { authRequired, soloRol } = require('../middlewares/auth')

const router = Router()

// cualquier usuario con sesión puede ver los retos activos (sin la respuesta correcta)
router.get('/', authRequired, RetoController.getRetos)
// el resto del CRUD es solo del administrador
router.get('/:id', authRequired, soloRol('administrador'), RetoController.getReto)
router.post('/', authRequired, soloRol('administrador'), RetoController.saveReto)
router.put('/:id', authRequired, soloRol('administrador'), RetoController.updateReto)
router.delete('/:id', authRequired, soloRol('administrador'), RetoController.deleteReto)
router.patch('/:id/estado', authRequired, soloRol('administrador'), RetoController.updateEstadoReto)

module.exports = router

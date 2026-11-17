const { Router } = require('express')

const RespuestaController = require('../controllers/respuestas')
const { authRequired, soloRol } = require('../middlewares/auth')

const router = Router()

// el jugador de la sesión responde y ve sus respuestas
router.post('/', authRequired, soloRol('jugador'), RespuestaController.saveRespuesta)
router.get('/', authRequired, RespuestaController.getMisRespuestas)
// el administrador puede ver las respuestas de cualquier jugador
router.get('/usuario/:usuarioId', authRequired, soloRol('administrador'), RespuestaController.getRespuestasByUsuario)

module.exports = router

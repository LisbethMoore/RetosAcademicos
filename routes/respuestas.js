const { Router } = require('express')

const RespuestaController = require('../controllers/respuestas')

const router = Router()

router.post('/', RespuestaController.saveRespuesta)
router.get('/usuario/:usuarioId', RespuestaController.getRespuestasByUsuario)

module.exports = router
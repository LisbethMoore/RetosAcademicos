const { Router } = require('express')

const PartidaController = require('../controllers/partidas')

const router = Router()

router.post('/', PartidaController.savePartida)
router.get('/usuario/:usuarioId', PartidaController.getPartidasByUsuario)

module.exports = router
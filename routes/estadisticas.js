const { Router } = require('express')

const EstadisticaController = require('../controllers/estadisticas')

const router = Router()

router.get('/jugadores', EstadisticaController.getDesempenoJugadores)
router.get('/retos-dificiles', EstadisticaController.getRetosDificiles)

module.exports = router

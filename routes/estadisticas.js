const { Router } = require('express')

const EstadisticaController = require('../controllers/estadisticas')
const { authRequired, soloRol } = require('../middlewares/auth')

const router = Router()

// las estadísticas son solo para el administrador
router.get('/jugadores', authRequired, soloRol('administrador'), EstadisticaController.getDesempenoJugadores)
router.get('/retos-dificiles', authRequired, soloRol('administrador'), EstadisticaController.getRetosDificiles)

module.exports = router

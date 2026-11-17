const { Router } = require('express')

const PartidaController = require('../controllers/partidas')
const { authRequired, soloRol } = require('../middlewares/auth')

const router = Router()

// el jugador de la sesión inicia su partida y ve su historial
router.post('/', authRequired, soloRol('jugador'), PartidaController.savePartida)
router.get('/', authRequired, PartidaController.getMisPartidas)
// el administrador puede ver el historial de cualquier jugador
router.get('/usuario/:usuarioId', authRequired, soloRol('administrador'), PartidaController.getPartidasByUsuario)

module.exports = router

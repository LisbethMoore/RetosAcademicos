const { Router } = require('express')

const RetoController = require('../controllers/retos')

const router = Router()

router.get('/', RetoController.getRetos)
router.post('/', RetoController.saveReto)
router.patch('/:id/estado', RetoController.updateEstadoReto)

module.exports = router
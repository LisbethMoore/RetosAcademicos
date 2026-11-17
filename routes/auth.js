const { Router } = require('express')

const AuthController = require('../controllers/auth')
const { authRequired } = require('../middlewares/auth')

const router = Router()

router.post('/registro', AuthController.registro)
router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)
router.get('/perfil', authRequired, AuthController.perfil)

module.exports = router

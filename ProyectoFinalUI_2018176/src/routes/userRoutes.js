'use stric'

var express = require("express")
var UserController = require("../controllers/userController")
var md_auth = require('../middlewares/authenticated')

//RUTAS
var api = express.Router();
api.post('/registrarAdmin', UserController.registrarAdmin)
api.post('/registrarUsuario', UserController.registrarUsuario)
api.post('/login', UserController.login)
api.put('/editar-usuario-logeado', md_auth.ensureAuth, UserController.editarUsuarioLogeado)
api.put('/editar-usuario/:id', md_auth.ensureAuth, UserController.editarUsuario)
api.delete('/eliminar-usuario-logeado', md_auth.ensureAuth, UserController.eliminarUsuarioLogeado)
api.delete('/eliminar-usuario/:id', md_auth.ensureAuth, UserController.eliminarUsuario)
api.get('/mostrar-info-usuario/:id',md_auth.ensureAuth, UserController.getInfoUser)
api.get('/mostrar-info-usuarios', md_auth.ensureAuth, UserController.getInfoUsers)
api.get('/mostrar-info-userLogeado', md_auth.ensureAuth, UserController.getUser)
api.put("/agregarAlCarrito/:usuarioId", md_auth.ensureAuth, UserController.addCompra)
api.put("/eliminarProductoCarrito", md_auth.ensureAuth, UserController.deleteCompra)
api.put("/actualizarCarrito", md_auth.ensureAuth, UserController.editarCarrito)



module.exports = api;
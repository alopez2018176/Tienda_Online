'use stric'

var express = require("express")
var CategoriaController = require("../controllers/categoriaController")
var md_auth = require('../middlewares/authenticated')

//RUTAS
var api = express.Router();
api.post('/registrarCategoria', md_auth.ensureAuth, CategoriaController.registrarCategoria)
api.put('/editar-categoria/:categoriaId', md_auth.ensureAuth, CategoriaController.editarCategoria)
api.delete('/eliminar-categoria/:categoriaId', md_auth.ensureAuth, CategoriaController.eliminarCategoria)
api.get('/mostrar-info-categoria/:id',md_auth.ensureAuth, CategoriaController.getInfoCategoria)

module.exports=api;
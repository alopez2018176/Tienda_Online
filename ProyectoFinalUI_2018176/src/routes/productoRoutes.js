'use stric'

var express = require("express")
var productoController = require("../controllers/productoController")
var md_auth = require("../middlewares/authenticated")


//RUTAS
var api = express.Router();
api.post("/registrarProducto", md_auth.ensureAuth, productoController.registrarProducto)
api.delete("/eliminarProducto/:productoId", md_auth.ensureAuth, productoController.eliminarProducto)
api.put("/editarProducto/:productoId", md_auth.ensureAuth, productoController.editarInfoProducto)
api.get("/productosXCategoria/:categoriaId", productoController.productoxCategoria)
api.get('/getMasVendido',productoController.productosMasVendidos)
api.get('/getAgotados',productoController.productosAgotados)



module.exports = api
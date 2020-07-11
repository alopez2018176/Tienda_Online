'use strict'

var express = require('express')
var FacturaController = require('../controllers/facturaController')
var md_auth = require('../middlewares/authenticated')

var api = express()
api.post('/extenderFactura/:id',md_auth.ensureAuth,FacturaController.extenderFactura)
api.post('/generarFacturaVirtual/:id',md_auth.ensureAuth,FacturaController.imprimirFactura)
// api.get('/getFacturas',md_auth.ensureAuth,FacturaC.verfacturas)
// api.get('/getFactura/:id',md_auth.ensureAuth,FacturaC.verfactura)
// api.get('/getMV',FacturaC.verVendidas)
// api.get('/getAgo',FacturaC.verAgotados)
// api.get('/getPCat/:categ',FacturaC.verPorCategoria)
api.get('/getProductName',FacturaController.productosPorNombre)

module.exports = api
'use strict'

var mongoose= require("mongoose")
var Schema = mongoose.Schema;

var FacturaSchema = Schema({
    fecha: Date,
    serie:  Number,
    usuario: {type: Schema.ObjectId, ref: 'user'},
    productos: [{
        productoId: { type: Schema.ObjectId, ref: 'producto'},
        cantidad: Number,
        subtotal: Number
    }],
    totalFactura: Number
})

module.exports = mongoose.model('factura',FacturaSchema)
'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    nombre: String,
    precio: Number,
    cantidad: Number,
    vendido: Number,
    categoria: {type: Schema.ObjectId, ref: 'categoria'}
})

module.exports = mongoose.model('producto', ProductoSchema);
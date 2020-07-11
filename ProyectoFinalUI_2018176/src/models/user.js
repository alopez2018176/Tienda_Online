'use stric'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UserSchema = Schema({
    nombre: String,
    usuario: String,
    email: String,
    password: String,
    rol: String,
    carrito: [{
        productoId: { type: Schema.ObjectId, ref: 'producto'},
        cantidad: Number,
        subtotal: Number
    }],

})

module.exports = mongoose.model('user', UserSchema);
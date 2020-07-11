'use strict'

//IMPORTS
var bcrypt = require('bcrypt-nodejs')
var User =  require('../models/user')
var jwt  = require("../services/jwt")
var Categoria = require("../models/categoria")
var Producto = require("../models/producto")
var path = require('path')
var fs = require('fs')

function registrarUsuario(req, res){
    var user = new User();
    var params = req.body

    if(params.nombre && params.password && params.email){
        user.nombre = params.nombre
        user.usuario = params.usuario
        user.email = params.email
        user.rol = 'ROLE_USER'

        User.find({ $or: [
            {usuario: user.usuario},
            {email: user.email}
        ]}).exec((err, users) => {
            if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de usuarios'})
            if(users && users.length >= 1){
                return res.status(500).send({message: 'El Usuario ya existe'})
            }else{
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, usuarioGuardado) => {
                        if(err) return res.status(500).send({message: 'Error al guardar el Usuario'})
                        if(usuarioGuardado){
                            res.status(200).send({user: usuarioGuardado})
                        }else{
                            res.status(404).send({message: 'No se ha podido registrar el Usuario'})
                        }
                    })
                })
            }
        })
    }else{
        res.status(200).send({
            message: 'Rellene todos los datos necesarios'
        })
    }
}

function registrarAdmin(req, res){
    var user = new User();
    var params = req.body

    if(params.nombre && params.password && params.email){
        user.nombre = params.nombre
        user.usuario = params.usuario
        user.email = params.email
        user.rol = 'ROLE_ADMIN'

        User.find({ $or: [
            {usuario: user.usuario},
            {email: user.email}
        ]}).exec((err, users) => {
            if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de usuarios'})
            if(users && users.length >= 1){
                return res.status(500).send({message: 'El Administrador ya existe'})
            }else{
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, usuarioGuardado) => {
                        if(err) return res.status(500).send({message: 'Error al guardar el Administrador'})
                        if(usuarioGuardado){
                            res.status(200).send({user: usuarioGuardado})
                        }else{
                            res.status(404).send({message: 'No se ha podido registrar el Administrador'})
                        }
                    })
                })
            }
        })
    }else{
        res.status(200).send({
            message: 'Rellene todos los datos necesarios'
        })
    }
}

function login(req, res){
    var params = req.body

    User.findOne({ email: params.email }, (err, usuario)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion' })    
    
    if(usuario){
        bcrypt.compare(params.password, usuario.password, (err, check)=>{
            if(check){
                if(params.gettoken){
                    return res.status(200).send({
                        token: jwt.createToken(usuario)
                    })
                }else{
                    usuario.password = undefined;
                    return res.status(200).send({ user: usuario })
                }
            }else{
                return res.status(404).send({ message: 'El usuario no se ha podido identificar' })
            }
        })
    }else{
        return res.status(404).send({ message: 'El usuario no se ha podido logear' })
    }
    })
}

function editarUsuarioLogeado(req, res){
    var params = req.body   

    delete params.password

    User.findByIdAndUpdate(req.user.sub, params, {new: true}, (err, usuarioActualizado) =>{
        if(err) return res.status(500).send({ message: 'Error en la peticion' })
        if(!usuarioActualizado) return res.status(404).send({ message: 'No has podido actualizar tu cuenta' })
        return res.status(200).send({ user: usuarioActualizado })
    })
}

function editarUsuario(req, res){
    var userId = req.params.id
    var params = req.body

    delete params.password

    if(req.user.rol == 'ROLE_ADMIN'){
        User.findByIdAndUpdate(userId, params, {new: true}, (err, usuarioActualizado) =>{
            if(err) return res.status(500).send({ message: 'Error en la peticion' })
            if(!usuarioActualizado) return res.status(404).send({ message: 'No se ha podido editar el Usuario' })
            return res.status(200).send({ user: usuarioActualizado })
        })
    }else{
        res.status(500).send({ message: 'No tiene los permisos para actualizar este usuario' })
    }   
}

function eliminarUsuarioLogeado(req, res){

    User.findByIdAndDelete(req.user.sub, (err, usuarioEliminado) =>{
        if(err) return res.status(500).send({ message: 'Error en la peticion' })
        if(!usuarioEliminado) return res.status(404).send({ message: 'No se ha podido eliminar el Usuario' })
        return res.status(200).send({ message: 'Usuario eliminado', user: usuarioEliminado })
    })
}

function eliminarUsuario(req, res){
    var userId = req.params.id

    if(req.user.rol == 'ROLE_ADMIN'){
        User.findByIdAndDelete(userId, (err, usuarioInactivo) =>{
            if(err) return res.status(500).send({ message: 'error en la peticion' })
            if(!usuarioInactivo) return res.status(404).send({ message: 'no se ha podido eliminar el usuario' })
            return res.status(200).send({ message: 'Usuario eliminado', user: usuarioInactivo })
        })
    }else{
        res.status(500).send({ message: 'No tiene los permisos para eliminar este usuario' })
    }
}

function getInfoUser(req, res){
    var userId = req.params.id

    if(req.user.rol == 'ROLE_ADMIN'){
        User.findById(userId, (err, usuarioLogeado) =>{
            if(err) return res.status(500).send({ message: 'Error en la peticion' })
            if(!usuarioLogeado) return res.status(404).send({ message: 'No se ha podido encontrar el usuario' })
            return res.status(200).send({ user: usuarioLogeado })
        })
    }else{
        res.status(500).send({ message: 'No tiene los permisos para actualizar este usuario' })
    }   
}

function getInfoUsers(req, res){
    if(req.user.rol == 'ROLE_ADMIN'){
        User.find({}, (err, usuarioSolicitado) =>{
            if(err) return res.status(500).send({ message: 'error en la peticion' })
            return res.status(200).send({ user: usuarioSolicitado })
        })
    }else{
        res.status(500).send({ message: 'No tiene los permisos para actualizar este usuario' })
    } 
}

function getUser(req, res){

    User.findById(req.user.sub, (err, usuarioLogeado) =>{
        if(err) return res.status(500).send({ message: 'Error en la peticion' })
        if(!usuarioLogeado) return res.status(404).send({ message: 'No se ha podido encontrar el usuario' })
        return res.status(200).send({ user: usuarioLogeado })
    })
}

function addCompra(req,res){
    var usuarioId = req.params.usuarioId
    var params = req.body
    var productoId = req.body.productoId

    User.findOne({_id: usuarioId, 'carrito.productoId': productoId },(err, productoEncontrado)=>{
        if(productoEncontrado){
            console.log(productoEncontrado);
            
            return res.status(500).send({message: "Este producto ya se encuentra agregado al carrito"+err})
        }else{
            Producto.findOne({_id: productoId, cantidad: {$gte: params.cantidad}},(err, productoStock)=>{
                if (err) return res.status(500).send({ message: 'Error en la peticion de productos ya que no tiene en stock' })
                if(!productoStock) return res.status(404).send({message: "Error al realizar agregar producto a sucursal" + err})
                if(productoStock.cantidad>=params.cantidad){
                    
                    User.findByIdAndUpdate(usuarioId, {$push: 
                        {carrito:{productoId: productoId, cantidad: params.cantidad, subtotal: params.cantidad*productoStock.precio}}}, {new: true}).exec((err, compras) => {
                        if (err) return res.status(500).send({ message: 'Error en la peticion de carrito de compras' })
                        if(!compras || compras==null) return res.status(404).send({message: "Error al realizar la peticion de agregar producto a carrito"})
                        return res.status(200).send({message: "Agregado el producto al carrito", Carrito: compras})
                    })
                }
            })
        }
        
        
    })
    
}

function deleteCompra(req,res){
    var userId = req.user.sub
    var productoId = req.body.productoId

    User.findByIdAndUpdate(userId, {$pull: {carrito: {productoId: productoId}}},(err, removeCarrito)=>{
        if(err)return res.status(500).send({message: "Error en la peticion de carrito de compras"})
        if(!removeCarrito) return res.status(404).send({message: "No se ha podido eliminar el producto del carrito de compras"})
        return res.status(200).send({Carrito: removeCarrito.carrito})
    })
}

function editarCarrito(req,res){
    var userId = req.user.sub
    var productoId = req.body.productoId
    var cantidad = req.body.cantidad

    Producto.findOne({_id:productoId, cantidad:{$gte: cantidad}}, (err, productoEncontrado)=>{
        if(err)return res.status(500).send({message: "Error en la peticion de productos"+err})
        if(!productoEncontrado) return res.status(404).send({message: "No se ha podido encontrar el producto"})

        User.findOne({_id:userId, carrito: {$elemMatch:{productoId: productoId}}},{'carrito.$': 1},(err, product)=>{
            if(err) return res.status(500).send({message: "Error en la peticion de editar el carrito"});

            var cantidadT= Number(cantidad) + product.carrito[0].cantidad
            var subtotalF = productoEncontrado.precio * cantidadT
            
            User.findOneAndUpdate({_id:userId, "carrito.productoId": productoId}, {"carrito.$.cantidad": cantidadT, 'carrito.$.subtotal': subtotalF},{new:true},(err, carritoActualizado)=>{
                if(err)return res.status(500).send({message: "Error en la peticion de cantidad de producto"+err})
                if(!productoEncontrado) return res.status(404).send({message: "No se ha podido actualizar el carrito"})
                return res.status(200).send({message: 'Carrito Actualizado', Carrito: carritoActualizado})
               
            })
        })
    })  
}


module.exports = {
    registrarUsuario,
    registrarAdmin,
    login,
    editarUsuario,
    editarUsuarioLogeado,
    eliminarUsuarioLogeado,
    eliminarUsuario,
    getInfoUser,
    getInfoUsers,
    getUser,
    addCompra,
    deleteCompra,
    editarCarrito

}
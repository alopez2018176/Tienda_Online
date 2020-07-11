'use strict'

//IMPORTS
var bcrypt = require('bcrypt-nodejs')
var Categoria =  require('../models/categoria')
var Producto = require('../models/producto')
var jwt  = require("../services/jwt")
var path = require('path')
var fs = require('fs')

function registrarCategoria(req, res){

    var categoria = new Categoria();
    var params = req.body
    if(req.user.rol == 'ROLE_ADMIN'){
        if(params.nombre){
            categoria.nombre = params.nombre
            categoria.descripcion = params.descripcion

            Categoria.find({ $or: [
                {nombre: categoria.nombre},
                {descripcion: categoria.descripcion}
            ]}).exec((err, categorias) => {
                if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de categorias'})
                if(categorias && categorias.length >= 1){
                    return res.status(500).send({message: 'La categoria ya existe'})
                }else{
                    categoria.save((err, categoriaGuardada) => {
                        if(err) return res.status(500).send({message: 'Error al guardar la categoria'})
                        if(categoriaGuardada){
                            res.status(200).send({Categoria: categoriaGuardada})
                        }else{
                            res.status(404).send({message: 'No se ha podido registrar la categoria'})
                        }
                    })
                    
                }
            })
        }else{
            res.status(200).send({
                message: 'Rellene todos los datos necesarios'
            })
        }
    }else{
        res.status(200).send({
            message: 'No cuenta con los permisos de usuario requeridos'
        })
    }
}

function editarCategoria(req, res){
    var params = req.body   

    if(req.user.rol == 'ROLE_ADMIN'){
        Categoria.findByIdAndUpdate(req.params.categoriaId, params, {new: true}, (err, categoriaActualizada) =>{
            if(err) return res.status(500).send({ message: 'Error en la peticion' })
            if(!categoriaActualizada) return res.status(404).send({ message: 'No has podido actualizar la categoria' })
            return res.status(200).send({ Categoria: categoriaActualizada })
        })
    }else{
        res.status(200).send({
            message: 'No cuenta con los permisos de usuario requeridos'
        })
    }
}

function crearCategoriaDef(req,res){
    Categoria.findOne({nombre: "default"},(err, defaultCategory)=>{
        if(!defaultCategory){
            var defect = new Categoria

            defect._id = '5e59dd4087da010e54f73aef'
            defect.nombre = "default"
            defect.descripcion = "Todos los productos"
            defect.save((err,defa)=>{
                if(err) return res.status(500).send({message: "Error al guardar la categoria"})
                    if(!defa) return res.status(404).send({message: "La categoría no se ha podido salvar"})
            })
        }else{

        }
    })
}

function eliminarCategoria(req, res){
    var categoriaId = req.params.categoriaId

    if(req.user.rol == 'ROLE_ADMIN'){   
        Categoria.findOneAndDelete({_id:categoriaId}, (err, categoriaInactiva) =>{
            if(err) return res.status(500).send({ message: 'Error en la peticion de categorias' })
            if(!categoriaInactiva) return res.status(404).send({ message: 'No se ha podido eliminar la categoría'+err })
            if(categoriaInactiva){
                crearCategoriaDef();
                console.log(categoriaInactiva._id);
                
                Producto.updateMany({categoria: categoriaInactiva._id}, {categoria: "5e59dd4087da010e54f73aef"},(err, ProductoC)=>{
                    if(err) console.log({message: 'Error al buscar productos'})
                    if(!ProductoC) console.log({message: "El producto no pudo ser editado con éxito"})        
                    if(ProductoC) console.log(ProductoC)
                })
                return res.status(200).send({ message: 'Categoria eliminada', Categoria: categoriaInactiva })

            }
        })
    }else{
        res.status(500).send({ message: 'No tiene los permisos para eliminar esta categoria' })
    }
}

function getInfoCategorias(req, res){
    if(req.user.rol == 'ROLE_ADMIN'){
        Categoria.find({}, (err, categoriaSolicitada) =>{
            if(err) return res.status(500).send({ message: 'error en la peticion' })
            return res.status(200).send({ Categorias: categoriaSolicitada })
        })
    }else{
        res.status(500).send({ message: 'No tiene los permisos para actualizar este usuario' })
    } 
}

function getInfoCategoria(req, res){
    var categoriaId = req.params.id

    if(req.user.rol == 'ROLE_ADMIN'){
        Categoria.findById(categoriaId, (err, categoriaDeseada) =>{
            if(err) return res.status(500).send({ message: 'Error en la peticion' })
            if(!categoriaDeseada) return res.status(404).send({ message: 'No se ha podido encontrar la categoria' })
            return res.status(200).send({ Categoria: categoriaDeseada })
        })
    }else{
        res.status(500).send({ message: 'No tiene los permisos para actualizar este usuario' })
    }   
}


module.exports ={
    registrarCategoria,
    editarCategoria,
    eliminarCategoria,
    getInfoCategorias,
    getInfoCategoria
}

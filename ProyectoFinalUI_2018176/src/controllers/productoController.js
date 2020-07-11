'use strict'

var Producto = require('../models/producto')
function registrarProducto(req,res){
    var producto = new Producto()
    var params = req.body

    if(req.user.rol == 'ROLE_ADMIN'){
        if(params.nombre && params.precio){
            producto.nombre = params.nombre
            producto.precio = params.precio
            producto.cantidad= params.cantidad
            producto.categoria = params.categoria

            Producto.find({ $or: [
                {nombre: producto.nombre}
            ]}).exec((err, productos) => {
                if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de productos'})
                if(productos && productos.length >= 1){
                    return res.status(500).send({message: 'El producto ya existe en la plataforma'})
                }else{
                    producto.save((err, productoAgregado) => {
                        if(err) return res.status(500).send({message: 'Error al guardar la informacion del producto '})
                        if(productoAgregado){
                            res.status(200).send({Producto: productoAgregado})
                        }else{
                            res.status(404).send({message: 'No se ha podido registrar el producto'})
                        }
                    })

                }
            })

        }
    }else{
        return res.status(404).send({message: "No cuenta con los permisos necesarios de Usuario"})
    }
}

function eliminarProducto(req,res){
    var productoId = req.params.productoId
    if(req.user.rol == 'ROLE_ADMIN'){
        Producto.findByIdAndDelete(productoId, (err, productoEliminado) =>{
            if(err) return res.status(500).send({ message: 'Error en la peticion' })
            if(!productoEliminado) return res.status(404).send({ message: 'No se ha podido eliminar el producto del sistema' })
            return res.status(200).send({ message: 'Producto eliminado', Producto: productoEliminado })

        })
    }else{
        return res.status(404).send({message: "No cuenta con los permisos requeridos de Usuario"})
    }
}

function editarInfoProducto(req,res){
    var productoId = req.params.productoId
    var params = req.body
    if(req.user.rol=="ROLE_ADMIN"){
        Producto.findByIdAndUpdate(productoId, params, {new: true}, (err, productoActualizado) =>{
            if(err) return res.status(500).send({ message: 'Error en la peticion' })
            if(!productoActualizado) return res.status(404).send({ message: 'No se ha podido editar la informacion del producto' })
            return res.status(200).send({ message: 'Producto Actualizado', Producto: productoActualizado })
        })
    }else{
        return res.status(404).send({message: 'No tiene los permisos requeridos de Usuario'})
    }
}

function productoxCategoria(req,res){
    Producto.find({categoria:req.params.categoriaId}).exec((err,productoCat)=>{
        if(err) return res.status(500).send({message:'Error al buscar los productos'+err})
        if(!productoCat) return res.status(404).send({message:'No se encotro el producto'})
        return res.status(200).send({ProductosXCategoria: productoCat})
    })
}

function productosMasVendidos(req,res){
    var resp = []
    Producto.find().sort('vendido'+1).exec((err,masVendido)=>{
        if(err) return res.status(500).send({message: 'Error al mostrar los productos '+err})
        if(!masVendido) return res.status(404).send({message:'No se visualiza los productos más vendidos'})
        resp.push(masVendido[0])
        resp.push(masVendido[1])
        resp.push(masVendido[2])
        return res.status(200).send({productosMasVendidos: resp})
    })
}

function productosAgotados(req,res){
    var resp = []
    Producto.find({cantidad:0}).exec((err,menosVendidos)=>{
        if(err) return res.status(500).send({message: 'Error al mostrar los productos'+err})
        if(!menosVendidos||menosVendidos.length<1) return res.status(404).send({message:'No se visualiza los productos menos vendidos'})
        return res.status(200).send({ProductosMenosVendidos:menosVendidos})
    })
}

module.exports = {
    registrarProducto,
    eliminarProducto,
    editarInfoProducto,
    productoxCategoria,
    productosMasVendidos,
    productosAgotados
}
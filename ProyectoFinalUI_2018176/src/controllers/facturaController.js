'use strict'

//IMPORTS

var Factura = require('../models/factura')
var PDFKit = require('pdfkit')
var files = require('fs')
var Producto = require('../models/producto')
var User = require('../models/user')

function extenderFactura(req,res){
    var factura = new Factura()
    var params = req.body

    Factura.find({},(err,facturas)=>{
        if(err) return res.status(500).send({message: 'Error al buscar Facturas'})
        console.log(facturas.length);
        if(facturas.length<1){
            factura.serie=0
        }else{
            if(facturas[facturas.length-1].numero<99999){
                factura.serie = facturas[facturas.length-1].serie
            }else{
                factura.serie = facturas[facturas.length-1].serie + 1
            }
        }

        var date = new Date
        var dia = date.getDate()
        var mes = date.getMonth()+1
        var year = date.getFullYear()
        factura.fecha =(year+'/'+mes+'/'+dia)
        console.log(factura.fecha);

        User.findById(req.params.id).populate('carrito.productoId').exec((err,usuario)=>{
            if(err) return res.status(500).send({message: 'Error al buscar Usuarios'})
            if(!usuario) return res.status(404).send({message:'No se ha encontrado el usuario'})
            var cont  = 0
            var acum
            do{
                acum = usuario.carrito[cont].cantidad
                if(acum<=usuario.carrito[cont].productoId.cantidad){
                    Producto.findByIdAndUpdate(usuario.carrito[cont].productoId,
                        {$inc:{cantidad:-usuario.carrito[cont].cantidad,vendido:1}},
                        (err,producto)=>{
                        if(err) return res.status(500).send({message: 'Error al buscar Usuarios'})
                        if(!producto) return res.status(404).send({message:'No se ha encontrado el Producto'})
                        })
                }else{
                    res.status(500).send({message: 'Error. No hay suficiente cantidad de: '+usuario.carrito[cont].productoId.nombre})
                }
                cont ++
            }while(cont<usuario.carrito.length)

            factura.productos = usuario.carrito
            factura.usuario = usuario.id

            User.findByIdAndUpdate(req.params.id,{$pull:{carrito:{}}},(err,usuarioE)=>{
               if(err) return res.status(500).send({message: 'Error al editar Usuario: '+err})
            })

            // Producto.findByIdAndUpdate({_id: productoId}, {$inc: {cantidad: -params.cantidad}},(err, menosProducto)=>{
            //     if(err) return res.status(404).send({message: "Error en la petición de restar cantidad"})
            //     if(!menosProducto) return res.status(200).send({message: "No se ha podido restar el producto"+err})
    
            // })

            factura.save((err,FacturaS)=>{
                if(err) return res.status(500).send({message: 'Error al guardar Factura: '+err})
                if(!FacturaS) return res.status(404).send({message:'No se ha guardado la factura'})
                if(FacturaS) return res.status(200).send({DetalleFactura:FacturaS})
            })
        })
    })
    
    // }else{
    //     return res.status(404).send({message: "No cuenta con los permisos necesarios de Usuario"})
    // }
}

function imprimirFactura(req,res){
    var pdf = new PDFKit
    var cont = 0

    var precioU = 0;
    var totalFactura =0;

    Factura.findOne({_id: req.params.id}).populate("usuario").exec((err,factura)=>{
        if(err) return res.status(500).send({message:'Error al buscar la factura: '+err})
        if(!factura) return res.status(404).send({message:'No se encontró la factura'})
        console.log(factura)
        pdf.font('Times New Roman')
        pdf.pipe(files.createWriteStream('./src/reports/facturaUsuario.pdf'))
        pdf.text('serie:'+factura.serie).fontSize(15)
        pdf.text('  ')
        pdf.text('  Producto detallado  |  Cantidad  |  Precio Unitario  |  Subtotal  ').fontSize(20)
        pdf.text('----------------------------------------------------------------------')
        pdf.text('  ')
        for (let index = 0; index < factura.productos.length; index++) {
            totalFactura = (factura.productos[index].subtotal*1) + totalFactura
            precioU= (factura.productos[index].subtotal*1)/(factura.productos[index].cantidad*1)
            console.log(precioU)
            pdf.text(factura.productos[index].productoId+'  |  '+factura.productos[index].cantidad+'  |  '+ precioU +'  |  '+factura.productos[index].subtotal).fontSize(20)
            pdf.text('  ')

        }
        console.log(cont);
        pdf.text('  ')
        pdf.text('  ')
        pdf.text('  ')
        pdf.text('  ')
        pdf.text("Total factura: Q." + totalFactura)
        pdf.text('  ')
        pdf.text('  ')
        pdf.text('  ')
        pdf.text('  ')
        pdf.text('  ')
        pdf.text("Cliente: " + factura.usuario.nombre)
        pdf.end()
        return res.status(200).send("Se ha emitido su factura con éxito")
    })
}

function productosPorNombre(req,res){
    var params = req.body
    Producto.find({nombre:{$regex:params.nombre,$options:'i'}},(err,ProductoEncontrado)=>{
        if(err) return res.status(500).send({message:'Error en la peticion de productos'+err})
        if(!ProductoEncontrado) return res.status(404).send({message:'No se encotro ningún producto con este parametro'})
        return res.status(200).send({Productos: ProductoEncontrado})
    })
}

module.exports= {
    extenderFactura,
    imprimirFactura,
    productosPorNombre
}
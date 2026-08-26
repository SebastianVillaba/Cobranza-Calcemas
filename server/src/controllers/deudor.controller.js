import sql from "mssql";
import { executeRequest } from "../utils/dbHandler.js";

const getDeudor = async (req, res) => {
    try {
        const { tipo, campo } = req.query;

        const result = await executeRequest({
            query: "sp_consultaCedulaCliente_web",
            isStoredProcedure: true,
            inputs: [
                { name: "tipo", type: sql.Int, value: tipo },
                { name: "campo", type: sql.VarChar(10), value: campo }
            ]
        });

        res.status(200).json({
            mensaje:'Consulta exitosa',
            respuesta:result.recordset
        });
    } catch (error) {
        console.log("Error en getUsuario: ", error);
        res.status(500).json({
            error: "Error al consultar data",
            mensaje: error.message
        });
        
    }
}

const getTiposPago = async (req,res) => {
    try {
        const result = await executeRequest({
            query: "select * from v_tipoCobro",
            isStoredProcedure: false,
        });
    
        res.status(200).json({
            mensaje:'Consulta exitosa de tipos de pago',
            respuesta:result.recordset
        });
        
    } catch (error) {
        console.log("Error en getTiposPago: ", error);
        res.status(500).json({
            error: "Error al consultar data",
            mensaje: error.message
        }); 
    }
}

const getFacturas = async (req, res) => {
    try {
        const { cobrador, cliente } = req.query;
    
        const cobradorInt = parseInt(cobrador);
        const clienteInt = parseInt(cliente);
       
        await executeRequest({
            query: "sp_cargarCuentaCliente_web",
            isStoredProcedure: true,
            inputs: [
                { name: "idCobrador", type: sql.Int, value: cobradorInt },
                { name: "idCliente", type: sql.Int, value: clienteInt }
            ]
        });
    
        const result = await executeRequest({
            query: "sp_consultaCuentaClienteWeb",
            isStoredProcedure: true,
            inputs: [
                { name: "idCobrador", type: sql.Int, value: cobradorInt },
            ]
        })
         
        res.status(200).json({
            mensaje:'Consulta exitosa',
            respuesta:result.recordset
        });
        
    } catch (error) {
        console.log("Error en getFacturas: ", error);
        res.status(500).json({
            error: "Error al consultar data",
            mensaje: error.message
        }); 
    }
}

const getFacturaDetalle = async (req, res) => {
    try {
        const { cobrador, idMov } = req.query;
    
        const cobradorInt = parseInt(cobrador);
        const idMovInt = parseInt(idMov);
    
        const result = await executeRequest({
            query: "sp_consultaCuentaClienteDetalleWeb",
            isStoredProcedure: true,
            inputs: [
                { name: "idCobrador", type: sql.Int, value: cobradorInt },
                { name: "idMovimiento", type: sql.Int, value: idMovInt },
            ]
        })
         
        res.status(200).json({
            mensaje:'Consulta exitosa',
            respuesta:result.recordset
        });
        
    } catch (error) {
        console.log("Error en getFacturas: ", error);
        res.status(500).json({
            error: "Error al consultar data",
            mensaje: error.message
        }); 
    }
}

const pagarFactura = async (req, res) => {
    try {
        const { cobrador, movimiento, nroCuota, pago } = req.body;

        const cobradorInt = parseInt(cobrador);
        const movimientoInt = parseInt(movimiento);
        const nroCuotaInt = parseInt(nroCuota);
        const pagoInt = parseInt(pago);

        const result = await executeRequest({
            isStoredProcedure: true,
            query: "sp_agregarTmpDetCuentaClienteWebCuota",
            inputs: [
                { name: "idCobrador", type: sql.Int, value: cobradorInt },
                { name: "idMovimiento", type: sql.Int, value: movimientoInt },
                { name: "nroCuota", type: sql.Int, value: nroCuotaInt },
                { name: "pago", type: sql.Int, value: pagoInt },
            ]
        });

        res.status(200).json({
            mensaje:'Pago exitoso',
            respuesta:result.recordset
        });
        
    } catch (error) {
        console.log("Error en getFacturas: ", error);
        res.status(500).json({
            error: "Error al procesar el pago",
            mensaje: error.message
        }); 
    }
}

const completarCobro = async (req,res) => {
    try {
        const { idCobrador, idCliente, idTipoCobro, totalCobro, idUsuario } = req.body;
    
        const cobradorInt = parseInt(idCobrador);
        const clienteInt = parseInt(idCliente);
        const tipoCobroInt = parseInt(idTipoCobro);
        const totalInt = parseInt(totalCobro);
        const usuarioInt = parseInt(idUsuario);
        const idConfig = 999;
    
        const result = await executeRequest({
            isStoredProcedure: true,
            query: "sp_guardarCobroClienteWeb",
            inputs: [
                { name: "idConfig", type: sql.Int, value: idConfig },
                { name: "idCliente", type: sql.Int, value: clienteInt },
                { name: "idCobrador", type: sql.Int, value: cobradorInt },
                { name: "idTipocobro", type: sql.Int, value: tipoCobroInt },
                { name: "totalCobro", type: sql.Money, value: totalInt },
                { name: "idUsuarioAlta", type: sql.Int, value: usuarioInt }
            ]
        });

        const cobro = await executeRequest({
            query: `select [dbo].[funIdCobroWeb] (${cobradorInt})`,
            isStoredProcedure: false
        })

        const resultFinal = {
            ...result,
            cobro: cobro.recordset[0]
        }
    
        res.status(200).json({
            mensaje:'Pago exitoso',
            respuesta:resultFinal
        });
        
    } catch (error) {
        console.log("Error en completarCobro: ", error);
        res.status(500).json({
            error: "Error al procesar el pago",
            mensaje: error.message
        }); 
    }
}

const actualizarTelefono = async (req, res) => {
    try {
        const { idCliente, celular } = req.body;

        if (!idCliente || !celular) {
            return res.status(400).json({
                error: "Datos incompletos",
                mensaje: "Se requiere idCliente y celular"
            });
        }

        const clienteInt = parseInt(idCliente);

        await executeRequest({
            query: `[sp_actualizarCelularClienteWeb]`,
            isStoredProcedure: true,
            inputs: [
                { name: "idCliente", type: sql.Int, value: clienteInt },
                { name: "celular", type: sql.VarChar(25), value: celular }
            ]
        });

        res.status(200).json({
            mensaje: 'Teléfono actualizado correctamente',
            respuesta: { idCliente: clienteInt, celular }
        });
        
    } catch (error) {
        console.log("Error en actualizarTelefono: ", error);
        res.status(500).json({
            error: "Error al actualizar el teléfono",
            mensaje: error.message
        });
    }
}

const consultaCobros = async (req,res) => {
    try {
        const { idCobrador } = req.query;

        if (!idCobrador) {
            return res.status(400).json({
                error: "Datos incompletos",
                mensaje: "Se requiere idCobrador"
            });
        }

        const cobradorInt = parseInt(idCobrador);

        const result = await executeRequest({
            query: `sp_consultaUltimosCobrosCobrador`,
            isStoredProcedure: true,
            inputs: [
                { name: "idCobrador", type: sql.Int, value: cobradorInt }
            ]
        });

        res.status(200).json({
            mensaje: 'Consulta exitosa',
            respuesta: result.recordset
        });
        
    } catch (error) {
        console.log("Error en consultaCobros: ", error);
        res.status(500).json({
            error: "Error al consultar el cobro",
            mensaje: error.message
        });
    }
}

const verificarCobroDia = async (req, res) => {
    try {
        const { idCobrador, idCliente } = req.query;

        if (!idCobrador || !idCliente) {
            return res.status(400).json({
                error: "Datos incompletos",
                mensaje: "Se requiere idCobrador e idCliente"
            });
        }

        const cobradorInt = parseInt(idCobrador);
        const clienteInt = parseInt(idCliente);

        const result = await executeRequest({
            query: "SELECT [dbo].[funCobroDia](@idCobrador, @idCliente) AS yaCobro",
            isStoredProcedure: false,
            inputs: [
                { name: "idCobrador", type: sql.Int, value: cobradorInt },
                { name: "idCliente", type: sql.Int, value: clienteInt }
            ]
        });

        const yaCobroVal = result.recordset && result.recordset.length > 0 ? result.recordset[0].yaCobro : 0;
        const yaCobro = (yaCobroVal === 1 || yaCobroVal === true) ? 1 : 0;

        res.status(200).json({
            mensaje: 'Consulta exitosa',
            respuesta: { yaCobro }
        });
    } catch (error) {
        console.log("Error en verificarCobroDia: ", error);
        res.status(500).json({
            error: "Error al verificar cobro del día",
            mensaje: error.message
        });
    }
}

export default {
    getDeudor,
    getFacturas,
    getFacturaDetalle,
    pagarFactura,
    completarCobro,
    getTiposPago,
    actualizarTelefono,
    consultaCobros,
    verificarCobroDia
}
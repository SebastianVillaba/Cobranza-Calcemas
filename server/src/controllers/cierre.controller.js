import sql from "mssql"
import { executeRequest } from "../utils/dbHandler.js";

const getCobros = async (req, res) => {
    try {
        const { cobrador } = req.query;
    
        const cobradorInt = parseInt(cobrador);
       
        await executeRequest({
            query: "sp_cargarDetRindeCobroTmp",
            isStoredProcedure: true,
            inputs: [
                { name: "idCobrador", type: sql.Int, value: cobradorInt },
                { name: "idConfig", type: sql.Int, value: 999 },
                { name: "idSucursal", type: sql.Int, value: 2 }
            ]
        });
    
        const result = await executeRequest({
            query: "sp_consultaDetRindeCobroTmp",
            isStoredProcedure: true,
            inputs: [
                { name: "idCobrador", type: sql.Int, value: cobradorInt },
                { name: "idConfig", type: sql.Int, value: 999 }
            ]
        })
         
        res.status(200).json({
            mensaje:'Consulta exitosa',
            respuesta:result.recordset
        });
        
    } catch (error) {
        console.log("Error en getCobros: ", error);
        res.status(500).json({
            error: "Error al consultar data",
            mensaje: error.message
        }); 
    }
};

const cerrarCobros = async (req,res) => {
    try {
        const { cobrador, total } = req.query;
    
        const cobradorInt = parseInt(cobrador);
        const totalInt = parseInt(total);
    
        const result = await executeRequest({
            query: "sp_guardarRindeCobradores",
            isStoredProcedure: true,
            inputs: [
                { name: "idConfig", type: sql.Int, value: 999 },
                { name: "idSucursal", type: sql.Int, value: 2 },
                { name: "idCobrador", type: sql.Int, value: cobradorInt },
                { name: "total", type: sql.Money, value: totalInt }
            ]
        })
         
        res.status(200).json({
            mensaje:'Cierre exitoso',
            respuesta:result.recordset
        });
        
    } catch (error) {
        console.log("Error en cerrarCobros: ", error);
        res.status(500).json({
            error: "Error al cerrar el cobro",
            mensaje: error.message
        }); 
    }
}

export default {
    getCobros,
    cerrarCobros
}
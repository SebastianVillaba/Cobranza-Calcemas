import sql from "mssql";
import { executeRequest } from "../utils/dbHandler.js";

const reciboCobro = async (req,res)=>{
    try {
        const { cobro } = req.query;

        const result = await executeRequest({
            query: "sp_reporteReciboCobro",
            isStoredProcedure: true,
            inputs: [
                { name: "idCobro", type: sql.Int, value: cobro }
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

export default {
    reciboCobro
};
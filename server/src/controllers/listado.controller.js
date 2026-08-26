import sql from "mssql";
import { executeRequest } from "../utils/dbHandler.js";

const agregarListadoCobranzaSemanal = async (req, res) => {
    try {
        const { idCobrador, fecha, hasta } = req.query;

        console.log(fecha,hasta);

        // Convertimos las fechas al formato estándar "YYYY-MM-DD" que SQL Server requiere
        const fechaFormatoDate = new Date(fecha);
        const hastaFormatoDate = new Date(hasta);

        await executeRequest({
            query: "sp_agregarTmpCuotaClienteDia",
            isStoredProcedure: true,
            timeout: 300000,
            inputs: [
                { name: "idConfig", type: sql.Int, value: 999 },
                { name: "idCobrador", type: sql.Int, value: idCobrador },
                { name: "fecha", type: sql.Date, value: fechaFormatoDate },
                { name : "hasta", type: sql.Date, value: hastaFormatoDate }
            ]
        });

        const result = await executeRequest({
            query: "sp_consultaCuotaClienteWeb",
            isStoredProcedure: true,
            timeout: 300000,
            inputs: [
                { name: "idConfig", type: sql.Int, value: 999 },
                { name: "idCobrador", type: sql.Int, value: idCobrador }
            ]
        })

        res.status(200).json({
            mensaje: 'Consulta exitosa en agregarListadoCobranzaSemanal',
            respuesta: result.recordset
        });

    } catch (error) {
        console.log("Error en agregarListadoCobranzaSemanal: ", error);
        res.status(500).json({
            error: "Error al agregar listado de cobranza semanal",
            mensaje: error.message
        });
    }
}

const agregarListadoCobranzaQuincenal = async (req, res) => {
    try {
        const { idCobrador, fecha } = req.query;

        await executeRequest({
            query: "sp_agregarTmpCuotaClienteQuincenal",
            isStoredProcedure: true,
            timeout: 300000,
            inputs: [
                { name: "idConfig", type: sql.Int, value: 999 },
                { name: "idCobrador", type: sql.Int, value: idCobrador },
                { name: "fecha", type: sql.Date, value: fecha }
            ]
        });

        const result = await executeRequest({
            query: "sp_consultaCuotaClienteWeb",
            isStoredProcedure: true,
            timeout: 300000,    
            inputs: [
                { name: "idConfig", type: sql.Int, value: 999 },
                { name: "idCobrador", type: sql.Int, value: idCobrador }
            ]
        })

        res.status(200).json({
            mensaje: 'Consulta exitosa en agregarListadoCobranzaQuincenal',
            respuesta: result.recordset
        });

    } catch (error) {
        console.log("Error en agregarListadoCobranzaQuincenal: ", error);
        res.status(500).json({
            error: "Error al agregar listado de cobranza quincenal",
            mensaje: error.message
        });
    }
}

const agregarListadoCobranzaMensual = async (req, res) => {
    try {
        const { idCobrador, fecha } = req.query;

        await executeRequest({
            query: "sp_agregarTmpCuotaClienteMensual",
            isStoredProcedure: true,
            timeout: 300000,
            inputs: [
                { name: "idConfig", type: sql.Int, value: 999 },
                { name: "idCobrador", type: sql.Int, value: idCobrador },
                { name: "fecha", type: sql.Date, value: fecha }
            ]
        });

        const result = await executeRequest({
            query: "sp_consultaCuotaClienteWeb",
            isStoredProcedure: true,
            timeout: 300000,
            inputs: [
                { name: "idConfig", type: sql.Int, value: 999 },
                { name: "idCobrador", type: sql.Int, value: idCobrador }
            ]
        })

        res.status(200).json({
            mensaje: 'Consulta exitosa en agregarListadoCobranzaMensual',
            respuesta: result.recordset
        });

    } catch (error) {
        console.log("Error en agregarListadoCobranzaMensual: ", error);
        res.status(500).json({
            error: "Error al agregar listado de cobranza mensual",
            mensaje: error.message
        });
    }
}

export default {
    agregarListadoCobranzaSemanal,
    agregarListadoCobranzaQuincenal,
    agregarListadoCobranzaMensual
};
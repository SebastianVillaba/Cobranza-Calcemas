import sql from "mssql"
import { executeRequest } from "../utils/dbHandler.js";

const ID_CONFIG = 999;
const ID_SUCURSAL = 2;

// Carga la tabla temporal de rendición del cobrador y devuelve los cobros pendientes de cierre
export const obtenerCobros = async (idCobrador) => {
    await executeRequest({
        query: "sp_cargarDetRindeCobroTmp",
        isStoredProcedure: true,
        inputs: [
            { name: "idCobrador", type: sql.Int, value: idCobrador },
            { name: "idConfig", type: sql.Int, value: ID_CONFIG },
            { name: "idSucursal", type: sql.Int, value: ID_SUCURSAL }
        ]
    });

    const result = await executeRequest({
        query: "sp_consultaDetRindeCobroTmp",
        isStoredProcedure: true,
        inputs: [
            { name: "idCobrador", type: sql.Int, value: idCobrador },
            { name: "idConfig", type: sql.Int, value: ID_CONFIG }
        ]
    });

    return result.recordset;
};

// Guarda la rendición (cierre) del cobrador
export const cerrarCobros = async (idCobrador, total) => {
    const result = await executeRequest({
        query: "sp_guardarRindeCobradores",
        isStoredProcedure: true,
        inputs: [
            { name: "idConfig", type: sql.Int, value: ID_CONFIG },
            { name: "idSucursal", type: sql.Int, value: ID_SUCURSAL },
            { name: "idCobrador", type: sql.Int, value: idCobrador },
            { name: "total", type: sql.Money, value: total }
        ]
    });

    return result.recordset;
};

export const obtenerNombreCobrador = async (idCobrador) => {
    const result = await executeRequest({
        query: "select [dbo].[funObtenerNombreCobrador] (@idCobrador) as nombreCobrador",
        inputs: [{ name: "idCobrador", type: sql.Int, value: idCobrador }]
    });

    return result.recordset[0]?.nombreCobrador;
};

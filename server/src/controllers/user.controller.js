import sql from "mssql"
import { executeRequest } from "../utils/dbHandler.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

const getUsuario = async (req, res) => {
    try {
        const { usuario, contra } = req.query;

        const result = await executeRequest({
            query: "sp_usuarioPassWeb",
            isStoredProcedure: true,
            inputs: [
                {
                    name: 'usuario',
                    type: sql.VarChar(20),
                    value: usuario
                },
                {
                    name: 'pass',
                    type: sql.VarChar(20),
                    value: contra
                }
            ]
        });

        // obtener el cobrador
        const cobrador = await executeRequest({
            query: `select [dbo].[funObtenerIdCobrador] (${result.recordset[0].idUsuario}) as idCobrador`
        })

        const cobradorNombre = await executeRequest({
            query: `select [dbo].[funObtenerNombreCobrador] (${cobrador.recordset[0].idCobrador}) as nombreCobrador`
        })

        // constante que da la informacion al client con el idCobrador tambien
        const resultFinal = {
            ...result.recordset[0],
            idCobrador: cobrador.recordset[0].idCobrador,
            nombreCobrador: cobradorNombre.recordset[0].nombreCobrador
        }

        // Generar JWT
        const token = jwt.sign(resultFinal, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            mensaje: 'Consulta exitosa',
            respuesta: resultFinal,
            token: token
        });
    } catch (error) {
        console.log("Error en getUsuario: ", error);
        res.status(500).json({
            error: "Error al consultar data",
            mensaje: error.message
        });

    }
}

const getAllUsuarios= async (req,res)=>{
    try {
        const result=await executeRequest({
            query: "select * from [dbo].[funVerUsuariosWeb_tabla] () order by nick",
            isStoredProcedure: false,
        });

        
        res.status(200).json({
            mensaje:'Todos los usuarios fueron consultados exitosamente',
            respuesta:result.recordset
        });
    } catch (error) {
        console.log("Error en getAllUsuarios: ", error);
        res.status(500).json({
            error: "Error al consultar todos los usuarios",
            mensaje: error.message
        });
        
    }
}
export default {
    getUsuario,
    getAllUsuarios
}

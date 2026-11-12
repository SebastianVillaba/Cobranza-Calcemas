import { obtenerCobros, cerrarCobros as guardarCierre } from "../services/cierre.service.js";

const getCobros = async (req, res) => {
    try {
        const { cobrador } = req.query;

        const cobradorInt = parseInt(cobrador);

        const respuesta = await obtenerCobros(cobradorInt);

        res.status(200).json({
            mensaje:'Consulta exitosa',
            respuesta
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

        const respuesta = await guardarCierre(cobradorInt, totalInt);

        res.status(200).json({
            mensaje:'Cierre exitoso',
            respuesta
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

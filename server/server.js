import dotenv from "dotenv"
import express from "express"
import cors from 'cors'

//IMPORTACION DE ROUTES
import usuarioRoute from "./src/routes/user.route.js";
import deudorRoute from "./src/routes/deudor.route.js";
import reporteRoute from "./src/routes/reporte.router.js";
import emailRoute from "./src/routes/email.route.js";
import cierreRoute from "./src/routes/cierre.route.js";
import listadoRoute from "./src/routes/listado.route.js";
import { authenticateToken } from "./src/middleware/auth.js";

dotenv.config();
const app=express();
const PORT=process.env.PORT;
app.use(express.json());
app.use(cors(
    {
        origin:['http://72.60.56.99', 'http://localhost:3000']
    }
));

//USO DE RUTAS
app.use('/api/usuarios', usuarioRoute)
app.use('/api/deudor', authenticateToken, deudorRoute)
app.use('/api/reportes', authenticateToken, reporteRoute)
app.use('/api/email', authenticateToken, emailRoute)
app.use('/api/cierre', authenticateToken, cierreRoute)
app.use('/api/listado', authenticateToken, listadoRoute)

app.listen(PORT,'0.0.0.0',() => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`)
});

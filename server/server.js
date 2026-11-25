import dotenv from "dotenv"
import express from "express"
import cors from 'cors'
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

//IMPORTACION DE ROUTES
import usuarioRoute from "./src/routes/user.route.js";
import deudorRoute from "./src/routes/deudor.route.js";
import reporteRoute from "./src/routes/reporte.router.js";
import emailRoute from "./src/routes/email.route.js";
import cierreRoute from "./src/routes/cierre.route.js";
import listadoRoute from "./src/routes/listado.route.js";
import { authenticateToken } from "./src/middleware/auth.js";
import { iniciarCierreAutomatico } from "./src/jobs/cierreAutomatico.job.js";

dotenv.config();
const app=express();
const PORT=process.env.PORT || 4000;
const HOST=process.env.HOST || '0.0.0.0';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Frontend compilado (npm run build en CalceMasCobranza). Se sirve desde este mismo
// servidor para que la app sea un unico servicio HTTP; el HTTPS lo pone el proxy de publicacion.
const FRONTEND_DIST = process.env.FRONTEND_DIST || path.join(__dirname, '..', 'CalceMasCobranza', 'dist');

// Detras del proxy de publicacion (HTTPS -> HTTP interno)
app.set('trust proxy', true);
app.use(express.json());
// Front y API van en el mismo origen, CORS solo hace falta para desarrollo u origenes extra
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({ origin: corsOrigins }));

//USO DE RUTAS
app.use('/api/usuarios', usuarioRoute)
app.use('/api/deudor', authenticateToken, deudorRoute)
app.use('/api/reportes', authenticateToken, reporteRoute)
app.use('/api/email', authenticateToken, emailRoute)
app.use('/api/cierre', authenticateToken, cierreRoute)
app.use('/api/listado', authenticateToken, listadoRoute)

//FRONTEND (React compilado) + fallback de la SPA
if (fs.existsSync(path.join(FRONTEND_DIST, 'index.html'))) {
    app.use(express.static(FRONTEND_DIST));
    app.use((req, res, next) => {
        if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
        res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
    });
} else {
    console.warn(`Frontend no encontrado en ${FRONTEND_DIST}; solo se sirve la API`);
}

app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`)
    iniciarCierreAutomatico();
});

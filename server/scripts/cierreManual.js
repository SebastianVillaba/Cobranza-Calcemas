// Ejecuta el cierre automático una sola vez (para pruebas): npm run cierre:manual
import dotenv from "dotenv";
dotenv.config();

const { ejecutarCierreAutomatico } = await import("../src/jobs/cierreAutomatico.job.js");

await ejecutarCierreAutomatico();
process.exit(0);

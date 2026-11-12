import cron from "node-cron";
import { obtenerCobros, cerrarCobros, obtenerNombreCobrador } from "../services/cierre.service.js";
import { sendMail } from "../utils/mailer.js";

const ZONA_HORARIA = "America/Asuncion";
const HORARIO = "45 23 * * *"; // todos los días a las 23:45
const DESTINATARIO = "infoenvios@calcemas.com";

let enEjecucion = false;

const formatoGs = (n) => `Gs. ${Math.trunc(Number(n) || 0).toLocaleString("es-PY")}`;

const fechaHoy = () => new Intl.DateTimeFormat("es-PY", {
    timeZone: ZONA_HORARIA, day: "2-digit", month: "2-digit", year: "numeric"
}).format(new Date());

const escapeHtml = (texto) => String(texto ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Lee los idCobrador configurados en CIERRE_AUTOMATICO_COBRADORES (separados por coma)
const obtenerIdsCobradores = () => [...new Set(
    (process.env.CIERRE_AUTOMATICO_COBRADORES || "")
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0)
)];

const procesarCobrador = async (idCobrador) => {
    const detalle = { idCobrador, nombre: `Cobrador ${idCobrador}`, cantidad: 0, total: 0, porTipo: {} };

    try {
        detalle.nombre = (await obtenerNombreCobrador(idCobrador)) || detalle.nombre;

        const cobros = await obtenerCobros(idCobrador);
        detalle.cantidad = cobros.length;

        if (cobros.length === 0) {
            return { ...detalle, estado: "sin_cobros" };
        }

        for (const c of cobros) {
            const monto = Number(c.total) || 0;
            detalle.total += monto;
            const tipo = c.nombreTipo || "Sin tipo";
            detalle.porTipo[tipo] = (detalle.porTipo[tipo] || 0) + monto;
        }

        await cerrarCobros(idCobrador, Math.trunc(detalle.total));
        return { ...detalle, estado: "cerrado" };
    } catch (error) {
        console.error(`[CierreAutomatico] Error con cobrador ${idCobrador}:`, error);
        return { ...detalle, estado: "error", error: error.message };
    }
};

const ESTADOS = {
    cerrado: { texto: "Cerrado", color: "#2e7d32" },
    sin_cobros: { texto: "Sin cobros", color: "#757575" },
    error: { texto: "Error", color: "#c62828" }
};

const armarHtml = (fecha, resultados) => {
    const cerrados = resultados.filter((r) => r.estado === "cerrado");
    const totalGeneral = cerrados.reduce((s, r) => s + r.total, 0);

    const filas = resultados.map((r) => {
        const estado = ESTADOS[r.estado];
        const tipos = Object.entries(r.porTipo)
            .map(([tipo, monto]) => `${escapeHtml(tipo)}: ${formatoGs(monto)}`)
            .join("<br>");
        const extra = r.estado === "error" ? escapeHtml(r.error) : tipos || "-";
        return `<tr>
            <td style="padding:6px;border:1px solid #ddd">${escapeHtml(r.nombre)} (${r.idCobrador})</td>
            <td style="padding:6px;border:1px solid #ddd;color:${estado.color};font-weight:bold">${estado.texto}</td>
            <td style="padding:6px;border:1px solid #ddd;text-align:right">${r.cantidad}</td>
            <td style="padding:6px;border:1px solid #ddd;text-align:right">${formatoGs(r.total)}</td>
            <td style="padding:6px;border:1px solid #ddd">${extra}</td>
        </tr>`;
    }).join("");

    const cuenta = (estado) => resultados.filter((r) => r.estado === estado).length;

    return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
        <h2 style="margin-bottom:4px">Cierre automático de cobranzas</h2>
        <p style="margin-top:0">Fecha: <b>${fecha}</b></p>
        <p>Cerrados: <b>${cuenta("cerrado")}</b> &nbsp;|&nbsp; Sin cobros: <b>${cuenta("sin_cobros")}</b> &nbsp;|&nbsp; Con error: <b>${cuenta("error")}</b></p>
        <table style="border-collapse:collapse">
            <thead><tr style="background:#f0f0f0">
                <th style="padding:6px;border:1px solid #ddd">Cobrador</th>
                <th style="padding:6px;border:1px solid #ddd">Estado</th>
                <th style="padding:6px;border:1px solid #ddd">Cobros</th>
                <th style="padding:6px;border:1px solid #ddd">Total</th>
                <th style="padding:6px;border:1px solid #ddd">Detalle</th>
            </tr></thead>
            <tbody>${filas}</tbody>
        </table>
        <p style="font-size:16px">Total general cerrado: <b>${formatoGs(totalGeneral)}</b></p>
        <p style="color:#888;font-size:12px">Correo generado automáticamente por el sistema de cobranzas.</p>
    </div>`;
};

export const ejecutarCierreAutomatico = async () => {
    if (enEjecucion) {
        console.warn("[CierreAutomatico] Ya hay un cierre en ejecución, se omite.");
        return;
    }
    enEjecucion = true;

    try {
        const ids = obtenerIdsCobradores();
        if (ids.length === 0) {
            console.warn("[CierreAutomatico] CIERRE_AUTOMATICO_COBRADORES vacío, no se cierra ningún cobrador.");
            return;
        }

        console.log(`[CierreAutomatico] Iniciando cierre para cobradores: ${ids.join(", ")}`);

        // Secuencial: todos comparten la misma tabla temporal (idConfig 999)
        const resultados = [];
        for (const id of ids) {
            resultados.push(await procesarCobrador(id));
        }

        resultados.forEach((r) =>
            console.log(`[CierreAutomatico] ${r.nombre} (${r.idCobrador}): ${r.estado}, ${r.cantidad} cobros, ${formatoGs(r.total)}`)
        );

        const fecha = fechaHoy();
        try {
            await sendMail({
                to: DESTINATARIO,
                subject: `Cierre automático de cobranzas - ${fecha}`,
                html: armarHtml(fecha, resultados)
            });
            console.log("[CierreAutomatico] Correo de cierre enviado.");
        } catch (error) {
            console.error("[CierreAutomatico] Error enviando correo de cierre:", error);
        }
    } catch (error) {
        console.error("[CierreAutomatico] Error general:", error);
    } finally {
        enEjecucion = false;
    }
};

export const iniciarCierreAutomatico = () => {
    if (process.env.CIERRE_AUTOMATICO_HABILITADO === "false") {
        console.log("[CierreAutomatico] Deshabilitado por configuración.");
        return;
    }

    cron.schedule(HORARIO, ejecutarCierreAutomatico, { timezone: ZONA_HORARIA, name: "cierre-automatico" });
    console.log(`[CierreAutomatico] Programado todos los días a las 23:45 (${ZONA_HORARIA}).`);
};

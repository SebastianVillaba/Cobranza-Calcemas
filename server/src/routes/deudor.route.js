import express from "express";
import deudorController from "../controllers/deudor.controller.js";

const router=express.Router();

router.get("/getDeudor",deudorController.getDeudor);

router.get("/getFacturas",deudorController.getFacturas);

router.get("/getDetalleFactura", deudorController.getFacturaDetalle);

router.post("/pagarFactura", deudorController.pagarFactura);

router.post("/completarCobro", deudorController.completarCobro);

router.get("/getTiposPago", deudorController.getTiposPago);

router.put("/actualizarTelefono", deudorController.actualizarTelefono);

router.get("/consultaCobros", deudorController.consultaCobros);

router.get("/verificarCobroDia", deudorController.verificarCobroDia);

export default router;
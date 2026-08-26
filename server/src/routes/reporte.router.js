import express from "express";
import reporteController from "../controllers/reporte.controller.js";

const router=express.Router();

router.get("/reciboCobro",reporteController.reciboCobro);

export default router;
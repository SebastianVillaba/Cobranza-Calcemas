import express from "express";
import cierreController from "../controllers/cierre.controller.js";

const router=express.Router();

router.get("/getCobros", cierreController.getCobros)
router.get("/cerrarCobros", cierreController.cerrarCobros)

export default router;
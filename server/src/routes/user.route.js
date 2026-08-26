import express from "express";
import usuarioController from "../controllers/user.controller.js"

const router=express.Router();

router.get("/getUsuario",usuarioController.getUsuario);
router.get("/getAllUsuarios", usuarioController.getAllUsuarios);

export default router;
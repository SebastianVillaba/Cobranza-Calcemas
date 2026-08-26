import { Router } from 'express';
import multer from 'multer';
import listadoController from '../controllers/listado.controller.js';

const router = Router();

router.get('/semanal', listadoController.agregarListadoCobranzaSemanal);
router.get('/quincenal', listadoController.agregarListadoCobranzaQuincenal);
router.get('/mensual', listadoController.agregarListadoCobranzaMensual);

export default router;

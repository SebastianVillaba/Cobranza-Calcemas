import { Router } from 'express';
import multer from 'multer';
import { sendEmailWithAttachment } from '../controllers/email.controller.js';

const router = Router();

// Configuración de almacenamiento para Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta para enviar correo, usando el controlador
router.post('/send', upload.single('pdf'), sendEmailWithAttachment);

export default router;

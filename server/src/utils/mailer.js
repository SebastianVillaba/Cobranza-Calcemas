import nodemailer from 'nodemailer';

// Crea el transportador de Nodemailer usando variables de entorno
export const createTransporter = () => nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    // Por defecto true (puerto 465); solo false si EMAIL_SECURE=false
    secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : true,
    auth: {
        user: process.env.EMAIL_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },
    // Configuración adicional para Hostinger
    tls: {
        rejectUnauthorized: false
    }
});

// Envía un correo y devuelve una promesa
export const sendMail = (mailOptions) => createTransporter().sendMail({
    from: process.env.EMAIL_EMAIL,
    ...mailOptions
});

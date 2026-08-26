import nodemailer from 'nodemailer';

export const sendEmailWithAttachment = (req, res) => {
    const pdf = req.file;

    if (!pdf) {
        return res.status(400).send('No se ha subido ningún archivo PDF.');
    }

    // Configura el transportador de Nodemailer usando variables de entorno
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: process.env.EMAIL_SECURE === 'true' || true,
        auth: {
            user: process.env.EMAIL_EMAIL,
            pass: process.env.EMAIL_PASSWORD
        },
        // Agregar configuración adicional para Hostinger
        tls: {
            rejectUnauthorized: false
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_EMAIL,
        to: "infoenvios@calcemas.com", // Permitir destinatario personalizado
        subject: 'Comprobante de Cobro - CalceMas',
        text: 'Adjunto se encuentra el comprobante de cobro en formato PDF.',
        attachments: [
            {
                filename: 'comprobante.pdf',
                content: pdf.buffer,
                contentType: 'application/pdf'
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error enviando email:', error);
            return res.status(500).json({ 
                error: 'Error al enviar el correo', 
                details: error.message 
            });
        }
        console.log('Email enviado:', info.response);
        res.status(200).json({ 
            message: 'Correo enviado exitosamente', 
            response: info.response 
        });
    });
};

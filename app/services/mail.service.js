import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config()

// Creamos el transporter de nodemailer para enviar correos
// Utiliza los datos del archivo .env para configurar el host, puerto y autenticación
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Servidor SMTP, por ejemplo smtp.gmail.com
    port: 465,                    // Puerto seguro para SMTP (SSL)
    secure: true,                 // Indica que se usa conexión segura (SSL/TLS)
    auth: {
        user: process.env.EMAIL_USER,       // Usuario del correo (email)
        pass: process.env.EMAIL_PASSWORD    // Contraseña o token de la cuenta de correo
    }
})

// Función que genera el contenido HTML del correo de verificación
// Recibe un token que se incluye en el enlace para verificar la cuenta
const crearMail = (token) => {
    return `<!DOCTYPE html>
                <html>
                <head>
                <meta charset="UTF-8">
                <title>Verificación de cuenta</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <tr>
                    <td style="padding: 30px; text-align: center;">
                        <h2 style="color: #333333;">Bienvenido a Nuestro Servicio</h2>
                        <p style="color: #555555; font-size: 16px;">
                        Gracias por registrarte. Estamos emocionados de tenerte con nosotros.
                        </p>
                        <p style="color: #555555; font-size: 16px;">
                        Para comenzar a usar tu cuenta, por favor verifica tu dirección de correo electrónico.
                        </p>

                        <!-- Botón con enlace que contiene el token para verificar cuenta -->
                        <a href="http://localhost:3000/verificar/${token}" target="_blank" rel="noopener noreferrer"
                        style="display: inline-block; margin-top: 30px; padding: 14px 24px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Para verificar tu cuenta haz click aquí
                        </a>

                        <p style="color: #888888; font-size: 12px; margin-top: 30px;">
                        Si no te registraste en nuestro sitio, puedes ignorar este correo.
                        </p>
                    </td>
                    </tr>
                </table>
                </body>
                </html>
                `
}

// Función asíncrona que envía el correo de verificación
// Recibe la dirección de correo destino y el token de verificación
export const enviarMail = async (direccion, token) => {
    return await transporter.sendMail({
        from: "CONFIRMACIÓN <yaelmexmontero63@gmail.com>", // Remitente visible en el correo
        to: direccion,                                     // Destinatario del correo
        subject: "VERIFICACION DE LA NUEVA CUENTA",       // Asunto del correo
        html: crearMail(token)                             // Contenido HTML generado con el token
    })
}

// Importación de módulos necesarios
import { Router } from "express";                                     // Router de Express para manejar rutas
import { methods as authentication } from "../controllers/authentication.controller.js"; // Métodos de autenticación
import { methods as authorization } from "../middlewares/authorization.js";              // Middleware de autorización

// Inicialización del router
export const router = Router();

// Ruta raíz "/" - Página de login
// Solo accesible si el usuario NO está logueado
router.get('/', authorization.onlyPublic, (req, res) => {
    res.render('login', {
        title: 'Login',
        css: "login" // Aplica el archivo de estilos login.css
    });
});

// Ruta "/register" - Página de registro
// Solo accesible si el usuario NO está logueado
router.get('/register', authorization.onlyPublic, (req, res) => {
    res.render('register', {
        title: 'Registro',
        css: "register"
    });
});

// Ruta "/inicio" - Página principal luego del login
// Solo accesible si el usuario está logueado
router.get('/inicio', authorization.onlyLoging, (req, res) => {
    res.render('inicio', {
        title: 'Inicio',
        css: "inicio"
    });
});

// Ruta "/registro-exitoso" - Muestra mensaje de éxito tras el registro
// Solo accesible si la sesión tiene datos de registro exitoso
router.get('/registro-exitoso', (req, res) => {
    if (!req.session.registroExitoso) {
        // Si no hay datos en la sesión, redirige a /register
        return res.redirect('/register');
    }

    const userData = req.session.registroExitoso;

    // Renderiza la vista con los datos del usuario
    res.render('registro-exitoso', {
        title: "Registro exitoso",
        message: "Se ha enviado un correo de verificación",
        email: userData.email,
        usuario: userData.usuario,
        css: "registro-exitoso"
    });

    // Limpia los datos de sesión para evitar recarga repetida
    delete req.session.registroExitoso;
});

// Rutas de autenticación con lógica en el controlador
router.post('/api/register', authentication.register);       // API para registrar nuevo usuario
router.post('/api/login', authentication.login);             // API para loguearse
router.get('/verificar/:id', authentication.verificarCuenta); // Ruta para verificar cuenta vía token (correo)

// Rutas comentadas para futuras funciones de recuperación de contraseña
// router.post('/forgot-password', authentication.forgotPassword);
// router.get('/reset-password/:token', validateResetToken);
// router.post('/reset-password/:token', resetPassword);

// Middleware para manejar errores 404 (ruta no encontrada)
router.use((req, res) => {
    const cookies = req.cookies || {};
    const jwt = cookies.jwt;

    // Si el usuario no tiene token JWT, lo redirige al login
    if (!jwt) {
        return res.redirect('/');
    }

    // Si tiene sesión pero la ruta no existe, muestra página 404
    res.status(404).render('404', {
        title: 'Página no encontrada',
        css: '404'
    });
});

// Importación de módulos necesarios
import express from "express"                           // Framework principal para servidor HTTP
import path from "path";                                // Módulo para manejar rutas del sistema de archivos
import { fileURLToPath } from "url";                    // Convierte import.meta.url a una ruta válida del sistema
import cookieParser from "cookie-parser";               // Middleware para parsear cookies
import handlebars from "express-handlebars";            // Motor de plantillas Handlebars
import session from "express-session";                  // Middleware para manejo de sesiones
import { router } from "./routes/routes.js";            // Importación de rutas definidas en otro archivo
import dotenv from "dotenv";                            // Carga variables de entorno desde .env

// Configuraciones iniciales
const app = express();                                  // Inicializa la aplicación de Express
const __dirname = path.dirname(fileURLToPath(import.meta.url));  // Obtiene el directorio actual del archivo
dotenv.config();                                        // Carga las variables del archivo .env

app.set('port', 3000);                                  // Define el puerto en el que se ejecutará la app

// Middlewares de configuración
app.use(express.static(path.join(__dirname, '/public'))); // Servir archivos estáticos desde la carpeta /public
app.use(express.json());                                // Permite recibir datos en formato JSON
app.use(express.urlencoded({ extended: true }));        // Permite recibir datos codificados desde formularios HTML

// Express no lee cookies por defecto, así que usamos cookie-parser
app.use(cookieParser());

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION,                        // Clave secreta para firmar la sesión (viene de .env)
    resave: false,                                      // No vuelve a guardar la sesión si no hubo cambios
    saveUninitialized: true,                            // Guarda sesiones nuevas no modificadas
    cookie: { secure: false }                           // secure en false porque no usamos HTTPS (en desarrollo)
}));

// Configuración del motor de plantillas Handlebars
app.engine('hbs', handlebars.engine({
    extname: '.hbs',                                    // Extensión de archivos de plantilla
    helpers: {
        // Helper personalizado: compara dos valores
        ifEquals: function (arg1, arg2, options) {
            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        }
    }
}));
app.set('view engine', 'hbs');                          // Define Handlebars como motor de vistas
app.set('views', path.join(__dirname, 'views'));        // Directorio donde se encuentran las vistas

// Rutas principales de la aplicación
app.use(router);                                        // Usa las rutas definidas en el archivo routes.js

// Inicia el servidor en el puerto especificado
app.listen(app.get('port'));
console.log(`Server corriendo en el puerto ${app.get('port')}`);

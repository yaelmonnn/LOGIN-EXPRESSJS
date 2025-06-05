// Importa el módulo mssql para conectarse a bases de datos SQL Server
import mssql from "mssql";

// Importa dotenv para poder leer variables de entorno desde un archivo .env
import dotenv from "dotenv";
dotenv.config(); // Carga las variables definidas en .env al entorno de ejecución

// Configuración de conexión a la base de datos usando variables de entorno
const connectionSettings = {
  server: process.env.BD_SERVER,     // Dirección del servidor SQL
  database: process.env.BD_NAME,     // Nombre de la base de datos
  user: process.env.BD_USER,         // Usuario para autenticarse
  password: process.env.BD_PASS,     // Contraseña del usuario
  options: {
    encrypt: true,                   // Requiere cifrado en la conexión (para Azure y seguridad)
    trustServerCertificate: true,   // Permite certificados autofirmados (útil en desarrollo local)
  },
};

// Función asincrónica para establecer y devolver una conexión con la base de datos
export const getConnection = async () => {
    try {
        return await mssql.connect(connectionSettings); // Conecta y retorna la conexión activa
    } catch (error) {
        console.log(error); // Muestra errores de conexión en consola
    }
}

// Exporta el módulo mssql por si se necesita directamente en otras partes del proyecto
export { mssql };

import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
import { verificarExistenciaUsuario } from "../controllers/authentication.controller.js";

dotenv.config();

// Función para parsear la cookie del header HTTP
// Toma el string de cookies (ejemplo: "jwt=token; otro=valor") y devuelve un objeto { jwt: "token", otro: "valor" }
const parseCookie = (cookieHeader) => {
  return Object.fromEntries(
    (cookieHeader || "").split("; ").map((cookie) => cookie.split("="))
  );
};

// Función para verificar la cookie JWT en la petición
// Recibe el objeto req (request)
// Devuelve true si la cookie es válida, el JWT fue firmado con nuestra clave y el usuario existe en la base de datos
// Devuelve false en cualquier error o si no cumple las condiciones
const verificarCookie = async (req) => {
  try {
    // Parseamos las cookies del header para obtener un objeto con las cookies
    const cookie = parseCookie(req.headers.cookie);

    // Variable para guardar el token JWT
    let jwt = "";

    // Si no existen cookies, regresamos false
    if (cookie === undefined) {
      return false;
    } else {
      // Obtenemos el token JWT de la cookie con llave 'jwt'
      jwt = cookie.jwt;
    }

    // Verificamos y decodificamos el JWT usando nuestra clave secreta
    // La función verify regresa el payload del token, que debe contener { user, iat, exp }
    const decodificado = jsonwebtoken.verify(jwt, process.env.JWT_SECRET);

    // Verificamos que el usuario exista en la base de datos con la función importada
    if (await verificarExistenciaUsuario(decodificado.user)) {
      // Si el usuario existe, retornamos true
      return true;
    }

    // Si no existe el usuario, retornamos false
    return false;
  } catch (err) {
    // Si ocurre cualquier error (token inválido, expirado, etc.) retornamos false
    return false;
  }
};

// Middleware para proteger rutas que requieren sesión iniciada (usuario logueado)
// Si el usuario está autenticado (cookie válida y usuario existe), llama a next() para continuar
// Si no, redirige al usuario a la página raíz "/"
const onlyLoging = async (req, res, next) => {
  const logueado = await verificarCookie(req);
  if (logueado) {
    return next();
  }
  return res.redirect("/");
};

// Middleware para proteger rutas que son públicas (solo accesibles si NO está logueado)
// Si no hay usuario autenticado, continúa con next()
// Si el usuario está logueado, redirige a la página principal "/inicio"
const onlyPublic = async (req, res, next) => {
  const logueado = await verificarCookie(req);
  if (!logueado) {
    return next();
  }
  return res.redirect("/inicio");
};

// Exportamos los middlewares para usarlos en las rutas
export const methods = {
  onlyLoging,
  onlyPublic,
};

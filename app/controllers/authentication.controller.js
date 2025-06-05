// Importación de dependencias necesarias
import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
import { mssql, getConnection } from "../database/connection.js";
import argon2 from "argon2";
import { enviarMail } from "../services/mail.service.js";

dotenv.config(); // Cargar variables de entorno desde .env

// Verifica si un nombre de usuario ya existe en la base de datos
export const verificarExistenciaUsuario = async (user) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("usuario", mssql.VarChar, user)
      .query("SELECT 1 FROM usuario WHERE usuario = @usuario");

    return result.recordset.length > 0;
  } catch (err) {
    return false;
  }
};

// Verifica si un correo electrónico ya está en uso por otro usuario
const verificarCorreoUsado = async (email) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("correo", mssql.VarChar, email)
      .query("SELECT 1 FROM usuario WHERE email = @correo");

    return result.recordset.length > 0;
  } catch (err) {
    return false;
  }
};

// Inserta un nuevo usuario con contraseña hasheada y estado inactivo (no verificado)
const insertarUsuario = async (user, email, pass) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("usuario", mssql.VarChar, user)
      .input("email", mssql.VarChar, email)
      .input("contraseña", mssql.VarChar, pass)
      .input("estado", mssql.Bit, 0)
      .query(
        "INSERT INTO usuario (usuario, email, contraseña, estado) VALUES (@usuario, @email, @contraseña, @estado)"
      );

    return result.rowsAffected[0] > 0;
  } catch (err) {
    return false;
  }
};

// Verifica si las credenciales de login son válidas y el usuario está activado
const verificarLogin = async (user, pass) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("usuario", mssql.VarChar, user)
      .input("estado", mssql.Bit, 1)
      .query(
        "SELECT contraseña FROM usuario WHERE usuario = @usuario AND estado = @estado"
      );

    if (result.recordset.length > 0) {
      const contraseña = result.recordset[0].contraseña;
      return await argon2.verify(contraseña, pass);
    }
    return false;
  } catch (err) {
    return false;
  }
};

// Actualiza el estado de un usuario a activo (verificado)
const actualizarEstadoUsuario = async (user) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("usuario", mssql.VarChar, user)
      .input("estado", mssql.Bit, 1)
      .query("UPDATE usuario SET estado = @estado WHERE usuario = @usuario");

    return result.rowsAffected[0] > 0;
  } catch (err) {
    return false;
  }
};

// Ruta que verifica el token recibido en el link de confirmación de correo
const verificarCuenta = async (req, res) => {
  if (!req.params.id) {
    return res.redirect("/");
  }

  // Verifica y decodifica el token
  const decodificado = jsonwebtoken.verify(
    req.params.id,
    process.env.JWT_SECRET
  );

  if (!decodificado || !decodificado.user) {
    return res.status(500).send({
      status: "Error",
      message: "Error en el token, no válido",
      redirect: "/",
    });
  }

  // Genera nuevo token JWT tras la verificación
  const token = jsonwebtoken.sign(
    { user: decodificado.user },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    path: "/",
  };

  // Si se activa correctamente el usuario, se le asigna cookie y redirige
  if (await actualizarEstadoUsuario(decodificado.user)) {
    res.cookie("jwt", token, cookieOption);
    return res.redirect("/");
  }

  return res.status(500).send({
    status: "Error",
    message: "Fallo al verificar el Email",
    redirect: "/",
  });
};

// Función que maneja el login de un usuario
const login = async (req, res) => {
  const user = req.body.user;
  const pass = req.body.password;

  if (!user || !pass) {
    return res.status(400).send({
      status: "Error",
      message: "Campos incompletos",
    });
  }

  if (await verificarLogin(user, pass)) {
    const token = jsonwebtoken.sign({ user: user }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    const cookieOption = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      path: "/",
    };

    res.cookie("jwt", token, cookieOption);

    return res.status(200).send({
      status: "ok",
      message: "Login Válido",
      redirect: "/inicio",
    });
  } else {
    return res.status(400).send({
      status: "Error",
      message: "Login Inválido",
    });
  }
};

// Función que maneja el registro de nuevos usuarios
const register = async (req, res) => {
  const user = req.body.user;
  const pass = req.body.password;
  const email = req.body.email;

  if (!user || !pass || !email) {
    return res.status(400).send({
      status: "Error",
      message: "Datos incompletos",
    });
  }

  if (await verificarExistenciaUsuario(user)) {
    return res.status(400).send({
      status: "Error",
      message: "El usuario ya existe, por favor intente con otro",
    });
  }

  if (await verificarCorreoUsado(email)) {
    return res.status(400).send({
      status: "Error",
      message: "El correo ya está registrado a un usuario",
    });
  }

  if (pass.length < 5 || pass.length > 50) {
    return res.status(400).send({
      status: "Error",
      message: "Por favor, ingrese una contraseña mayor a 5 carácteres",
    });
  }

  const hashPass = await argon2.hash(pass);

  const tokenVerificacion = jsonwebtoken.sign(
    { user: user },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  const mail = await enviarMail(email, tokenVerificacion);
  if (mail.accepted === 0) {
    return res.status(500).send({
      status: "Error",
      message: "Error enviando mail de verificación",
    });
  }

  if (await insertarUsuario(user, email, hashPass)) {
    req.session.registroExitoso = {
      usuario: user,
      email: email,
    };

    return res.status(201).send({
      status: "ok",
      message: `Usuario: ${user} insertado correctamente!!`,
      redirect: "/registro-exitoso",
    });
  } else {
    return res.status(400).send({
      status: "Error",
      message: "Error en la inserción del usuario",
    });
  }
};

// Exportación de los métodos públicos que serán utilizados en las rutas
export const methods = {
  register,
  login,
  verificarCuenta,
};

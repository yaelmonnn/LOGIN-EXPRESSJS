// Agrega un listener al evento submit del formulario con clase .form-login
document.querySelector(".form-login").addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita el comportamiento por defecto del formulario (recargar página)

  // Envía la solicitud de inicio de sesión usando fetch al backend
  const result = await fetch("http://localhost:3000/api/login", {
    method: "POST", // Método HTTP
    headers: {
      "Content-Type": "application/json", // Tipo de contenido enviado
    },
    body: JSON.stringify({
      // Convierte los datos del formulario a JSON
      user: e.target.usuario.value,       // Obtiene el valor del input con name="usuario"
      password: e.target.contrasena.value // Obtiene el valor del input con name="contrasena"
    }),
  });

  // Parsea la respuesta a formato JSON
  const resJson = await result.json();

  // Si la respuesta no fue exitosa (status >= 400)
  if (!result.ok) {
    const errorElement = document.querySelector(".error"); // Selecciona el elemento donde mostrar errores

    // Asegura que el mensaje de error se muestre correctamente
    errorElement.classList.remove("error-no-mostrado"); // Elimina clase que oculta el error
    errorElement.innerText = resJson.message;           // Muestra mensaje de error del servidor
    errorElement.classList.add("error-mostrado");       // Añade clase que muestra el error con estilo
    return; // Detiene la ejecución
  }

  // Si la respuesta incluye una redirección, la realiza
  if (resJson.redirect) {
    window.location.href = resJson.redirect; // Redirige a la ruta especificada
  }
});

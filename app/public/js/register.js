// Agrega un listener al evento submit del formulario con clase .form-register
document.querySelector('.form-register').addEventListener('submit', async (e) => {
    e.preventDefault(); // Previene el envío tradicional del formulario (evita recargar la página)

    // Cambia el texto y estilo del botón mientras se procesa la solicitud
    const boton = document.querySelector('.boton-env');
    boton.innerText = "PROCESANDO....";     // Muestra mensaje de carga
    boton.style.color = "#ffffff";          // Cambia el color del texto del botón
    boton.setAttribute('disabled', 'true'); // Desactiva el botón para evitar múltiples envíos

    // Envío de la solicitud POST al endpoint de registro
    const result = await fetch('http://localhost:3000/api/register', {
        method: "POST", // Método HTTP
        headers: {
            "Content-Type": "application/json" // Indica que se enviarán datos en formato JSON
        },
        body: JSON.stringify({
            // Obtiene los valores del formulario y los convierte a JSON
            user: e.target.usuario.value,        // Input con name="usuario"
            email: e.target.correo.value,        // Input con name="correo"
            password: e.target.contrasena.value  // Input con name="contrasena"
        })
    });

    // Convierte la respuesta del servidor a formato JSON
    const resJson = await result.json();

    // Si hubo un error en la respuesta del servidor (status >= 400)
    if (!result.ok) {
        const errorElement = document.querySelector('.error'); // Selecciona el contenedor del error
        errorElement.classList.remove('error-no-mostrado');    // Asegura que sea visible
        errorElement.innerText = resJson.message;              // Muestra el mensaje recibido
        errorElement.classList.add('error-mostrado');          // Aplica clase de estilo para errores
        return; // Detiene el flujo para evitar continuar con la redirección
    }

    // Si la respuesta incluye una redirección, la realiza automáticamente
    if (resJson.redirect) {
        window.location.href = resJson.redirect; // Redirige a la URL proporcionada (por ejemplo, /registro-exitoso)
    }
});

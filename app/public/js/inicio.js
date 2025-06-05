// Función que cierra sesión (logout) con animación
function logout() {
  // Aplica animación CSS al <body> para efecto de desvanecimiento
  document.body.style.animation = "fadeOut 0.5s ease-out forwards";

  // Espera 500 ms (duración de la animación) antes de cerrar sesión
  setTimeout(() => {
    // Elimina la cookie JWT estableciendo una fecha de expiración pasada
    document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // Redirige al usuario a la página de login
    window.location.href = '/';
  }, 500);
}

// Cuando el DOM se ha cargado completamente
document.addEventListener("DOMContentLoaded", function () {
  // Selecciona todos los elementos con la clase .particle
  const particles = document.querySelectorAll(".particle");

  // Itera sobre cada partícula para animarlas de forma individual
  particles.forEach((particle, index) => {
    // Crea una animación periódica para cada partícula
    setInterval(() => {
      // Genera valores aleatorios para desplazar la partícula en X e Y
      const randomX = Math.random() * 20 - 10;  // Rango: -10px a +10px
      const randomY = Math.random() * 20 - 10;
      // Aplica transformación de movimiento aleatorio acumulativo
      particle.style.transform += ` translate(${randomX}px, ${randomY}px)`;
    }, 3000 + index * 500); // Se ejecuta cada 3s más un desfase por partícula
  });
});

// Crea una regla CSS para la animación de desvanecimiento (fadeOut)
const style = document.createElement("style"); // Crea un nuevo elemento <style>
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
// Agrega la animación al <head> del documento
document.head.appendChild(style);

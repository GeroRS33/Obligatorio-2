// --------------------------------------------
// Obtenemos los elementos del formulario (DOM)
// --------------------------------------------
const btnEntrar = document.getElementById("btnEntrar");             // Botón de "Entrar"
const inputNombre = document.getElementById("inputNombreLog");     // Campo de nombre de usuario
const inputContraseña = document.getElementById("inputContraseñaLog"); // Campo de contraseña
const mensajeError = document.getElementById("formError");         // Elemento para mostrar mensajes de error
const linkRegistrarme = document.getElementById("registrarme");    // Link para ir al registro

// --------------------------------------------
// Evento: cuando el usuario hace click en "Entrar"
// --------------------------------------------
btnEntrar.addEventListener("click", async () => {
  // Obtenemos los valores de los campos y quitamos espacios
  const username = inputNombre.value.trim();
  const password = inputContraseña.value.trim();

  // Validación: no dejar campos vacíos
  if (!username || !password) {
    mostrarError("No dejes ningún campo vacío");
    return;
  }

  try {
    // Enviamos los datos al servidor usando fetch (POST)
    const response = await fetch("https://obligatorio-2-jpi9.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Indicamos que el contenido es JSON
      body: JSON.stringify({ username, password })     // Enviamos los datos convertidos a JSON
    });

    // Si la respuesta no fue exitosa, mostramos el mensaje correspondiente
    if (!response.ok) {
      if (response.status === 400) {
        mostrarError("Faltan datos"); // Datos incompletos
      } else if (response.status === 401) {
        mostrarError("Usuario o contraseña incorrectos"); // Datos inválidos
      } else {
        mostrarError("Error de conexión con el servidor"); // Otro tipo de error
      }
      return; // Salimos de la función si hubo error
    }

    // Si todo salió bien, convertimos la respuesta en objeto JS
    const data = await response.json();

    // Guardamos el usuario y su ID en el localStorage (para usarlo en otras páginas)
    localStorage.setItem("username", data.username);
    localStorage.setItem("userId", data.userId);

    // Redirigimos al home
    window.location.href = "home.html";

  } catch (error) {
    // Si ocurrió un error inesperado, lo mostramos en consola y en pantalla
    console.error("Error al hacer login:", error);
    mostrarError("Error inesperado. Intenta más tarde.");
  }
});

// --------------------------------------------
// Link para ir al formulario de registro
// --------------------------------------------
linkRegistrarme.addEventListener("click", (e) => {
  e.preventDefault(); // Evitamos que el link recargue la página
  window.location.href = "register.html"; // Vamos a la página de registro
});

// --------------------------------------------
// Función reutilizable para mostrar errores
// --------------------------------------------
function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;   // Mostramos el texto del error
  mensajeError.style.color = "red";     // Color rojo para destacar
  mensajeError.style.display = "block"; // Nos aseguramos de que se vea
}

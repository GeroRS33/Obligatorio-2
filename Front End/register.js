// ===========================================
// Elementos
// ===========================================
const inputNombre = document.getElementById("inputNombreReg"); // Campo de nombre
const inputContraseña = document.getElementById("inputContraseñaReg"); // Campo de contraseña
const btnRegistrar = document.getElementById("registrarUser"); // Botón de registrar
const formError = document.getElementById("formErrorReg"); // Elemento para mostrar mensajes
const btnVolver = document.getElementById("volverBtn"); // Botón para volver atrás (login)

// ===========================================
// Registrarse 
// ===========================================
btnRegistrar.addEventListener("click", async () => {
  // Leemos los valores de los campos y quitamos espacios
  const username = inputNombre.value.trim();
  const password = inputContraseña.value.trim();

  // Validamos que los campos no estén vacíos
  if (!username || !password) {
    formError.textContent = "No dejes ningún campo vacío";
    formError.style.color = "red";
    formError.style.display = "block";
    return;
  }

  try {
    // Enviamos los datos al servidor usando fetch con método POST
    const response = await fetch("https://obligatorio-2-jpi9.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Indicamos que enviamos JSON
      body: JSON.stringify({ username, password }) // Convertimos los datos a JSON
    });

    // Si hubo error, mostramos mensaje según el tipo
    if (!response.ok) {
      if (response.status === 409) {
        // 409 = Usuario ya existe
        formError.textContent = "El usuario ya existe";
      } else if (response.status === 400) {
        // 400 = Faltan datos
        formError.textContent = "Faltan datos";
      } else {
        formError.textContent = "Error de conexión";
      }
      formError.style.color = "red";
      formError.style.display = "block";
      return;
    }

    // Si todo salió bien, convertimos la respuesta a objeto JS
    const data = await response.json();

    // Guardamos el nombre y el ID del usuario en localStorage
    localStorage.setItem("username", data.username);
    localStorage.setItem("userId", data.userId);

    // Mostramos mensaje de éxito
    formError.textContent = "¡Usuario registrado con éxito!";
    formError.style.color = "green";
    formError.style.display = "block";

    // Redirigimos al login después de 1.5 segundos
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    // Si hubo un error inesperado (por ejemplo, no hay conexión)
    console.error("Error al registrar:", error);
    formError.textContent = "Error inesperado. Intenta más tarde.";
    formError.style.color = "red";
    formError.style.display = "block";
  }
});

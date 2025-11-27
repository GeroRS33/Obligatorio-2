const btnEntrar = document.getElementById("btnEntrar");
const inputNombre = document.getElementById("inputNombreLog");
const inputContraseña = document.getElementById("inputContraseñaLog");
const mensajeError = document.getElementById("formError");
const linkRegistrarme = document.getElementById("registrarme");

btnEntrar.addEventListener("click", async () => {
  const username = inputNombre.value.trim();
  const password = inputContraseña.value.trim();

  if (!username || !password) {
    mostrarError("No dejes ningún campo vacío");
    return;
  }

  try {
    const response = await fetch("https://obligatorio-2-jpi9.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      if (response.status === 400) {
        mostrarError("Faltan datos");
      } else if (response.status === 401) {
        mostrarError("Usuario o contraseña incorrectos");
      } else {
        mostrarError("Error de conexión con el servidor");
      }
      return;
    }

    const data = await response.json();

    // Guardar usuario en localStorage
    localStorage.setItem("username", data.username);
    localStorage.setItem("userId", data.userId);

    // Redirigir al home
    window.location.href = "home.html";

  } catch (error) {
    console.error("Error al hacer login:", error);
    mostrarError("Error inesperado. Intenta más tarde.");
  }
});

linkRegistrarme.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "register.html";
});

// Función reutilizable para mostrar errores
function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.style.color = "red";
  mensajeError.style.display = "block";
}

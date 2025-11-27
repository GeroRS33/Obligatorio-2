
const inputNombre = document.getElementById("inputNombreReg");
const inputContraseña = document.getElementById("inputContraseñaReg");
const btnRegistrar = document.getElementById("registrarUser");
const formError = document.getElementById("formErrorReg");
const btnVolver = document.getElementById("volverBtn");

// registrarse
btnRegistrar.addEventListener("click", async () => {
  const username = inputNombre.value.trim();
  const password = inputContraseña.value.trim();

  if (!username || !password) {
    formError.textContent = "No dejes ningún campo vacío";
    formError.style.color = "red";
    formError.style.display = "block";
    return;
  }

  try {
    const response = await fetch("https://obligatorio-2-jpi9.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      if (response.status === 409) {
        formError.textContent = "El usuario ya existe";
      } else if (response.status === 400) {
        formError.textContent = "Faltan datos";
      } else {
        formError.textContent = "Error de conexión";
      }
      formError.style.color = "red";
      formError.style.display = "block";
      return;
    }

    const data = await response.json();

    // Guardar en localStorage 
    localStorage.setItem("username", data.username);
    localStorage.setItem("userId", data.userId);

    // mostrar exxito y redirigir
    formError.textContent = "¡Usuario registrado con éxito!";
    formError.style.color = "green";
    formError.style.display = "block";

    setTimeout(() => {
      window.location.href = "index.html"; // redirige al login
    }, 1500);

  } catch (error) {
    console.error("Error al registrar:", error);
    formError.textContent = "Error inesperado. Intenta más tarde.";
    formError.style.color = "red";
    formError.style.display = "block";
  }
});

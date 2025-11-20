// Elementos del DOM
const btnEntrar = document.getElementById("btnEntrar");
const inputNombre = document.getElementById("inputNombreLog");
const inputContraseña = document.getElementById("inputContraseñaLog");
const mensajeError = document.getElementById("formError");
const linkRegistrarme = document.getElementById("registrarme");

// Al hacer clic en "Entrar"
btnEntrar.addEventListener("click", () => {
  const nombre = inputNombre.value.trim();
  const contraseña = inputContraseña.value.trim();

  if (nombre === "" || contraseña === "") {
    mensajeError.textContent = "No dejes ningún campo vacío";
    mensajeError.style.color = "red";
  } else {
    // En este punto podrías validar contra backend si quisieras

    // Por ahora, simplemente redirigimos al home
    window.location.href = "home.html";
  }
});

// Al hacer clic en "No tengo cuenta aún"
linkRegistrarme.addEventListener("click", (e) => {
  e.preventDefault(); // Evita que salte al tope de la página si es un <a>
  window.location.href = "register.html";
});

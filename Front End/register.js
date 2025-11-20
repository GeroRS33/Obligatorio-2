// Elementos del DOM
const inputNombre = document.getElementById("inputNombreReg");
const inputMail = document.getElementById("inputMailReg");
const inputContraseña = document.getElementById("inputContraseñaReg");
const btnRegistrar = document.getElementById("registrarUser");
const formError = document.getElementById("formErrorReg");
const btnVolver = document.getElementById("volverBtnLogin");

// Al hacer clic en "Registrarme"
btnRegistrar.addEventListener("click", () => {
  const nombre = inputNombre.value.trim();
  const mail = inputMail.value.trim();
  const contraseña = inputContraseña.value.trim();

  if (!nombre || !mail || !contraseña) {
    formError.textContent = "No dejes ningún campo vacío";
    formError.style.color = "red";
    return;
  }

  // Acá podrías enviar al backend si tuvieras uno activo
  console.log("Usuario registrado:", { nombre, mail, contraseña });

  // Mensaje de éxito y redirección al login
  formError.textContent = "¡Usuario registrado con éxito!";
  formError.style.color = "green";

  setTimeout(() => {
    window.location.href = "index.html"; // Volver al login
  }, 1500);
});

// Al hacer clic en "volver"
btnVolver.addEventListener("click", () => {
  window.location.href = "index.html";
});

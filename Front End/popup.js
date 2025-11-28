// Esperamos que todo el HTML esté cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = "https://obligatorio-2-jpi9.onrender.com";

  // ============================
  // Leer el "slug" de la URL
  // ============================
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug"); // Ejemplo: ?slug=inception

  // ============================
  // Referencias a elementos del DOM
  // ============================
  const popup = document.getElementById('popup');
  const btnAgregar = document.querySelector('.btnAgregarOpinion');
  const stars = document.querySelectorAll('.stars span');
  const textarea = document.querySelector('textarea');
  const btnSubir = document.querySelector('.btnsubir');
  const opinionesContainer = document.querySelector('#opinionesContainer');

  let selectedRating = 0; // Almacena el rating elegido por el usuario

  // ============================
  // Actualizar las estrellas grandes de la película
  // ============================
  function actualizarRating() {
    if (!slug) return;

    fetch(`${API_BASE}/movies/${slug}/detalle`)
      .then(res => res.ok ? res.json() : Promise.reject("Error al obtener detalles"))
      .then(pelicula => {
        const estrellas = document.querySelector(".estrellas");
        if (!estrellas) return;

        const estrellasNum = Math.round(pelicula.rating || 0);

        // Creamos el texto con estrellas llenas y vacías
        estrellas.textContent = "★".repeat(estrellasNum) + "☆".repeat(5 - estrellasNum);
      })
      .catch(err => console.error("Error actualizando rating:", err));
  }

  // ============================
  // Función para mostrar una opinión en la página
  // ============================
  function renderOpinion(opinion) {
    const opinionDiv = document.createElement("div");
    opinionDiv.className = "opinion";

    const pTexto = document.createElement("p");
    pTexto.textContent = opinion.comment;

    const infoDiv = document.createElement("div");
    const spanAutor = document.createElement("span");
    spanAutor.className = "autor";
    spanAutor.textContent = opinion.username;

    const spanRating = document.createElement("span");
    spanRating.className = "rating";
    spanRating.textContent = "Rated: " + opinion.rating + " ★";

    infoDiv.appendChild(spanAutor);
    infoDiv.appendChild(document.createElement("br"));
    infoDiv.appendChild(spanRating);

    opinionDiv.appendChild(pTexto);
    opinionDiv.appendChild(infoDiv);

    opinionesContainer.appendChild(opinionDiv);
  }

  // ============================
  // Cargar todas las opiniones desde la API
  // ============================
  function cargarOpinionesDesdeAPI() {
    if (!slug || !opinionesContainer) return;

    opinionesContainer.innerHTML = "Cargando opiniones...";

    fetch(`${API_BASE}/movies/${slug}/opiniones`)
      .then(res => res.ok ? res.json() : Promise.reject("Error al obtener opiniones"))
      .then(data => {
        const opiniones = data.opiniones || [];
        const userId = localStorage.getItem("userId");

        // Validar si ya opinó
        if (btnAgregar) {
          const yaOpino = opiniones.some(op => String(op.userId) === String(userId));
          btnAgregar.disabled = yaOpino;
          btnAgregar.textContent = yaOpino ? "Ya dejaste una opinión" : "Agregar tu opinión +";
          btnAgregar.style.opacity = yaOpino ? "0.6" : "1";
          btnAgregar.style.cursor = yaOpino ? "not-allowed" : "pointer";
        }

        // Mostrar las opiniones
        if (opiniones.length === 0) {
          opinionesContainer.innerHTML = "¡Sé el primero en opinar!";
          actualizarRating();
          return;
        }

        opinionesContainer.innerHTML = "";
        opiniones.forEach(renderOpinion);

        actualizarRating();
      })
      .catch(err => {
        console.error("Error cargando opiniones:", err);
        opinionesContainer.innerHTML = "Error cargando opiniones.";
      });
  }

  // ============================
  // Abrir el popup para opinar
  // ============================
  if (btnAgregar && popup) {
    btnAgregar.addEventListener('click', () => {
      popup.style.display = 'flex';
    });
  }

  // Cerrar el popup si se hace click fuera del contenido
  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.style.display = 'none';
      }
    });
  }

  // ============================
  // Elegir el número de estrellas
  // ============================
  for (let i = 0; i < stars.length; i++) {
    stars[i].addEventListener('click', () => {
      selectedRating = i + 1;
      stars.forEach((star, j) => {
        star.classList.toggle('active', j < selectedRating);
      });
    });
  }

  // ============================
  // Subir una nueva opinión
  // ============================
  if (btnSubir) {
    btnSubir.addEventListener('click', () => {
      const opinionTexto = textarea.value.trim();
      const userId = localStorage.getItem("userId");
      const username = localStorage.getItem("username");

      if (!userId || !username) {
        alert("Debes estar logueado para opinar.");
        return;
      }

      if (!opinionTexto || selectedRating === 0) {
        alert("Por favor, escribe una opinión y elige un rating.");
        return;
      }

      if (!slug) {
        alert("No se encontró la película.");
        return;
      }

      // Enviamos la nueva opinión a la API
      fetch(`${API_BASE}/movies/${slug}/opinion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          username,
          rating: selectedRating,
          comment: opinionTexto
        })
      })
        .then(res => {
          if (!res.ok) return res.text().then(text => { throw new Error(text); });
          return res.text();
        })
        .then(() => {
          // Si se envió bien, limpiamos el formulario y recargamos opiniones
          cargarOpinionesDesdeAPI();
          textarea.value = '';
          selectedRating = 0;
          stars.forEach(star => star.classList.remove('active'));
          popup.style.display = 'none';
        })
        .catch(err => {
          console.error("Error al enviar opinión:", err);
          alert(err.message || "Error al enviar opinión");
        });
    });
  }

  // ============================
  // Al cargar la página, traemos las opiniones
  // ============================
  if (slug) {
    cargarOpinionesDesdeAPI();
  }
});

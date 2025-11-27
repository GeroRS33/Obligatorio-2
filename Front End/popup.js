document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = "https://obligatorio-2-jpi9.onrender.com";

  // Leer slug de la URL (?slug=inception)
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  // REFERENCIAS DEL DOM
  const popup = document.getElementById('popup');
  const btnAgregar = document.querySelector('.btnAgregarOpinion');
  const stars = document.querySelectorAll('.stars span');
  const textarea = document.querySelector('textarea');
  const btnSubir = document.querySelector('.btnsubir');
  const opinionesContainer = document.querySelector('#opinionesContainer');

  let selectedRating = 0;

  // ===================== FUNCIONES AUXILIARES =====================

  // Actualizar solo las estrellas del detalle según rating de la API
  function actualizarRating() {
    if (!slug) {
      console.error("No hay slug para actualizar el rating");
      return;
    }

    fetch(`${API_BASE}/movies/${slug}/detalle`)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Error al obtener detalles para actualizar rating");
        }
        return res.json();
      })
      .then(function (pelicula) {
        const estrellas = document.querySelector(".estrellas");
        if (!estrellas) return;

        const estrellasNum = Math.round(pelicula.rating || 0);

        // versión simple sin repeat()
        let textoEstrellas = "";
        for (let i = 0; i < 5; i++) {
          if (i < estrellasNum) {
            textoEstrellas += "★";
          } else {
            textoEstrellas += "☆";
          }
        }

        estrellas.textContent = textoEstrellas;
      })
      .catch(function (err) {
        console.error("Error actualizando rating:", err);
      });
  }

  // Renderizar UNA opinión en el HTML
  function renderOpinion(opinion) {
    const opinionDiv = document.createElement("div");
    opinionDiv.className = "opinion";

    const pTexto = document.createElement("p");
    pTexto.textContent = opinion.comment;

    const infoDiv = document.createElement("div");

    const spanAutor = document.createElement("span");
    spanAutor.className = "autor";
    spanAutor.textContent = opinion.username;

    const br = document.createElement("br");

    const spanRating = document.createElement("span");
    spanRating.className = "rating";
    spanRating.textContent = "Rated: " + opinion.rating + " ★";

    infoDiv.appendChild(spanAutor);
    infoDiv.appendChild(br);
    infoDiv.appendChild(spanRating);

    opinionDiv.appendChild(pTexto);
    opinionDiv.appendChild(infoDiv);

    opinionesContainer.appendChild(opinionDiv);
  }

  // ===================== CARGAR OPINIONES DESDE LA API =====================
function cargarOpinionesDesdeAPI() {
  if (!slug) {
    console.error("No hay slug en la URL");
    return;
  }

  if (!opinionesContainer) return;

  opinionesContainer.innerHTML = "Cargando opiniones...";

  fetch(`${API_BASE}/movies/${slug}/opiniones`)
    .then(function (res) {
      if (!res.ok) {
        throw new Error("Error al obtener opiniones");
      }
      return res.json();
    })
    .then(function (data) {
      const opiniones = data.opiniones || [];

      // 🧠 Leer userId del localStorage
      const userId = localStorage.getItem("userId");

      // 🔒 Manejo del botón "Agregar tu opinión"
      const btnAgregar = document.querySelector(".btnAgregarOpinion");
      if (btnAgregar) {
        if (userId) {
          // ¿Ya existe una opinión de este user en esta peli?
          const yaOpino = opiniones.some(function (op) {
            return String(op.userId) === String(userId);
          });

          if (yaOpino) {
            // Deshabilitar y cambiar texto
            btnAgregar.disabled = true;
            btnAgregar.textContent = "Ya dejaste una opinión";
            btnAgregar.style.opacity = "0.6";
            btnAgregar.style.cursor = "not-allowed";
          } else {
            // Asegurarse de que esté habilitado si NO opinó
            btnAgregar.disabled = false;
            btnAgregar.textContent = "Agregar tu opinión +";
            btnAgregar.style.opacity = "1";
            btnAgregar.style.cursor = "pointer";
          }
        } else {
          // Si no hay user logueado
          btnAgregar.disabled = false;
          btnAgregar.textContent = "Agregar tu opinión +";
          btnAgregar.style.opacity = "1";
          btnAgregar.style.cursor = "pointer";
        }
      }

      // 📝 Mostrar mensaje si no hay opiniones
      if (opiniones.length === 0) {
        opinionesContainer.innerHTML = "¡Sé el primero en opinar!";
        actualizarRating();
        return;
      }

      // Renderizar opiniones
      opinionesContainer.innerHTML = "";
      for (let i = 0; i < opiniones.length; i++) {
        renderOpinion(opiniones[i]);
      }

      // Actualizar rating luego de mostrar la lista
      actualizarRating();
    })
    .catch(function (err) {
      console.error("Error cargando opiniones:", err);
      opinionesContainer.innerHTML = "Error cargando opiniones.";
    });
}

  // ===================== POPUP Y ESTRELLAS =====================

  // Mostrar el popup
  if (btnAgregar && popup) {
    btnAgregar.addEventListener('click', () => {
      popup.style.display = 'flex';
    });
  }

  // Cerrar el popup al hacer clic fuera del contenido
  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.style.display = 'none';
      }
    });
  }

  // Selección de estrellas
  for (let i = 0; i < stars.length; i++) {
    stars[i].addEventListener('click', function () {
      selectedRating = i + 1;
      for (let j = 0; j < stars.length; j++) {
        if (j < selectedRating) {
          stars[j].classList.add('active');
        } else {
          stars[j].classList.remove('active');
        }
      }
    });
  }

  // ===================== SUBIR OPINIÓN A LA API =====================

  if (btnSubir) {
    btnSubir.addEventListener('click', () => {
      const opinionTexto = textarea.value.trim();

      const userId = localStorage.getItem("userId");
      const username = localStorage.getItem("username");

      if (!userId || !username) {
        alert("Debes estar logueado para opinar.");
        return;
      }

      if (opinionTexto === '' || selectedRating === 0) {
        alert("Por favor, escribe una opinión y elige un rating.");
        return;
      }

      if (!slug) {
        alert("No se encontró la película (slug inválido).");
        return;
      }

      console.log("Enviando opinión con:", {
        userId,
        username,
        rating: selectedRating,
        comment: opinionTexto
      });

      fetch(`${API_BASE}/movies/${slug}/opinion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: userId,
          username: username,
          rating: selectedRating,
          comment: opinionTexto
        })
      })
        .then(function (res) {
          if (!res.ok) {
            return res.text().then(function (text) {
              throw new Error(text || "Error al agregar la opinión");
            });
          }
          return res.text();
        })
        .then(function (msg) {
          console.log("Opinión agregada:", msg);

          // Recargar opiniones (y dentro de eso se actualiza el rating)
          cargarOpinionesDesdeAPI();

          // Limpiar popup
          textarea.value = '';
          selectedRating = 0;
          for (let i = 0; i < stars.length; i++) {
            stars[i].classList.remove('active');
          }
          popup.style.display = 'none';
        })
        .catch(function (err) {
          console.error("Error al enviar opinión:", err);
          alert(err.message || "Error al enviar opinión");
        });
    });
  }

  // ===================== AL CARGAR LA PÁGINA =====================

  if (slug) {
    cargarOpinionesDesdeAPI(); // carga opiniones y actualiza rating al entrar al detalle
  }
});
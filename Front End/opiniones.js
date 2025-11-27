const API_BASE = "https://obligatorio-2-jpi9.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  const usernameSpan = document.getElementById("username");
  if (usernameSpan) {
    usernameSpan.textContent = username || "usuario";
  }

  const iconLogout = document.getElementById("iconLogout");
  if (iconLogout) {
    iconLogout.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  const contenedor = document.getElementById("opinionesList");
  const popupEditar = document.getElementById("popupEditar");
  const textareaEditar = document.getElementById("textareaEditar");
  const btnGuardarEdicion = document.getElementById("btnGuardarEdicion");
  const starsContainer = document.getElementById("starsEditar");
  const starsEditar = starsContainer ? starsContainer.querySelectorAll("span") : [];
  const tituloPeliculaSpan = document.querySelector("#popupEditar .tituloPelicula");

  const popupEliminar = document.getElementById("popupEliminar");
  const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
  const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");

  let selectedRatingEditar = 0;
  let opinionIdActual = null;
  let slugActual = null;
  let botonEditActual = null;

  let opinionIdAEliminar = null;
  let slugAEliminar = null;
  let btnEliminarActual = null;

  if (!userId) {
    contenedor.innerHTML = "<p style='color:white;'>no estás logueado.</p>";
    return;
  }

  fetch(`${API_BASE}/users/${userId}/opiniones`)
    .then(res => res.json())
    .then(data => {
      const opiniones = data.opiniones;
      if (!Array.isArray(opiniones) || opiniones.length === 0) {
        contenedor.innerHTML = "<p style='color:white;'>todavía no escribiste opiniones.</p>";
        return;
      }

      opiniones.forEach(op => {
        const div = document.createElement("div");
        div.className = "opinion";

        fetch(`${API_BASE}/movies/${op.movieSlug}/detalle`)
          .then(res => res.json())
          .then(pelicula => {
            const posterUrl = pelicula.posterUrl || "img/placeholder.jpg";
            div.innerHTML = `
              <div class="opinionInfo">
                <img src="${posterUrl}" alt="${op.movieTitle}" class="posterOpinion">
                <div>
                  <h3 class="movieTitle">${op.movieTitle}</h3>
                  <p class="comment">${op.comment}</p>
                  <span class="rating">★ <span class="ratingValue">${op.rating}</span>/5</span>
                </div>
              </div>
              <div class="opinionActions">
                <button 
                  type="button"
                  class="editBtn" 
                  data-id="${op.opinionId}" 
                  data-slug="${op.movieSlug}"
                  data-comment="${op.comment.replace(/"/g, '&quot;')}"
                  data-rating="${op.rating}"
                  data-movie-title="${op.movieTitle.replace(/"/g, '&quot;')}"
                >
                  <img src="img/editar.svg" alt="editar opinión" class="iconOpinion">
                </button>
                <button 
                  type="button"
                  class="deleteBtn" 
                  data-id="${op.opinionId}" 
                  data-slug="${op.movieSlug}"
                >
                  <img src="img/eliminar.svg" alt="eliminar opinión" class="iconOpinion">
                </button>
              </div>
            `;
            contenedor.appendChild(div);
          });
      });

      contenedor.addEventListener("click", (event) => {
        const deleteBtn = event.target.closest(".deleteBtn");
        const editBtn = event.target.closest(".editBtn");

        // === ELIMINAR ===
        if (deleteBtn) {
          event.preventDefault();
          event.stopPropagation();

          opinionIdAEliminar = deleteBtn.dataset.id;
          slugAEliminar = deleteBtn.dataset.slug;
          btnEliminarActual = deleteBtn;

          if (popupEliminar) {
            popupEliminar.style.display = "flex";
          }
          return;
        }

        // === EDITAR ===
        if (editBtn) {
          event.preventDefault();
          event.stopPropagation();

          opinionIdActual = editBtn.dataset.id;
          slugActual = editBtn.dataset.slug;
          botonEditActual = editBtn;

          const oldComment = editBtn.dataset.comment;
          const oldRating = Number(editBtn.dataset.rating);
          const movieTitle = editBtn.dataset.movieTitle;

          if (tituloPeliculaSpan) tituloPeliculaSpan.textContent = movieTitle || "";
          if (textareaEditar) textareaEditar.value = oldComment || "";

          selectedRatingEditar = oldRating || 0;
          actualizarEstrellasEditar();

          if (popupEditar) popupEditar.style.display = "flex";
        }
      });

      // === CONFIRMAR ELIMINAR ===
      if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener("click", () => {
          if (!opinionIdAEliminar || !slugAEliminar || !btnEliminarActual) return;

          fetch(`${API_BASE}/movies/${slugAEliminar}/opiniones/${opinionIdAEliminar}`, {
            method: "DELETE"
          })
            .then(res => {
              if (!res.ok) throw new Error("error al borrar opinión");
              btnEliminarActual.closest(".opinion").remove();
              cerrarPopupEliminar();
            })
            .catch(err => {
              console.error(err);
              alert("error al borrar la opinión");
              cerrarPopupEliminar();
            });
        });
      }

      if (btnCancelarEliminar) {
        btnCancelarEliminar.addEventListener("click", cerrarPopupEliminar);
      }

      function cerrarPopupEliminar() {
        if (popupEliminar) popupEliminar.style.display = "none";
        opinionIdAEliminar = null;
        slugAEliminar = null;
        btnEliminarActual = null;
      }

      // === CERRAR EDITAR POPUP ===
      if (popupEditar) {
        popupEditar.addEventListener("click", (e) => {
          if (e.target === popupEditar) cerrarPopupEditar();
        });
      }

      for (let i = 0; i < starsEditar.length; i++) {
        starsEditar[i].addEventListener("click", () => {
          selectedRatingEditar = i + 1;
          actualizarEstrellasEditar();
        });
      }

      function actualizarEstrellasEditar() {
        for (let j = 0; j < starsEditar.length; j++) {
          starsEditar[j].classList.toggle("active", j < selectedRatingEditar);
        }
      }

      function cerrarPopupEditar() {
        if (popupEditar) popupEditar.style.display = "none";
        opinionIdActual = null;
        slugActual = null;
        botonEditActual = null;
        selectedRatingEditar = 0;
        if (textareaEditar) textareaEditar.value = "";
        actualizarEstrellasEditar();
      }

      // === GUARDAR EDICIÓN ===
      if (btnGuardarEdicion) {
        btnGuardarEdicion.addEventListener("click", () => {
          if (!opinionIdActual || !slugActual) {
            alert("error interno: falta opinión o película.");
            return;
          }

          const nuevoComentario = textareaEditar.value.trim();
          if (nuevoComentario.length < 5) {
            alert("el comentario debe tener al menos 5 caracteres.");
            return;
          }

          if (selectedRatingEditar < 1 || selectedRatingEditar > 5) {
            alert("el rating debe estar entre 1 y 5 estrellas.");
            return;
          }

          fetch(`${API_BASE}/movies/${slugActual}/opiniones/${opinionIdActual}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              rating: selectedRatingEditar,
              comment: nuevoComentario
            })
          })
            .then(res => {
              if (!res.ok) throw new Error("error al editar opinión");
              return res.text();
            })
            .then(() => {
              if (botonEditActual) {
                const opinionDiv = botonEditActual.closest(".opinion");
                const pComment = opinionDiv.querySelector(".comment");
                const spanRatingValue = opinionDiv.querySelector(".ratingValue");

                if (pComment) pComment.textContent = nuevoComentario;
                if (spanRatingValue) spanRatingValue.textContent = selectedRatingEditar;

                botonEditActual.dataset.comment = nuevoComentario;
                botonEditActual.dataset.rating = selectedRatingEditar;
              }

              cerrarPopupEditar();
            })
            .catch(err => {
              console.error(err);
              alert("error al editar la opinión");
            });
        });
      }
    })
    .catch(err => {
      console.error("error cargando opiniones:", err);
      contenedor.innerHTML = "<p style='color:white;'>error al cargar tus opiniones.</p>";
    });
});

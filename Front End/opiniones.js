// opiniones.js

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
  if (!contenedor) {
    console.error("no se encontró #opinionesList");
    return;
  }

  // referencias del popup editar
  const popupEditar = document.getElementById("popupEditar");
  const textareaEditar = document.getElementById("textareaEditar");
  const btnGuardarEdicion = document.getElementById("btnGuardarEdicion");
  const starsContainer = document.getElementById("starsEditar");
  const starsEditar = starsContainer ? starsContainer.querySelectorAll("span") : [];
  const tituloPeliculaSpan = document.querySelector("#popupEditar .tituloPelicula");

  let selectedRatingEditar = 0;
  let opinionIdActual = null;
  let slugActual = null;
  let botonEditActual = null;

  if (!userId) {
    contenedor.innerHTML = "<p style='color:white;'>no estás logueado.</p>";
    return;
  }

  // traer opiniones del usuario
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

        div.innerHTML = `
          <div class="opinionInfo">
            <h3 class="movieTitle">${op.movieTitle}</h3>
            <p class="comment">${op.comment}</p>
            <span class="rating">
              ★ <span class="ratingValue">${op.rating}</span>/5
            </span>
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
              📝
            </button>
            <button 
              type="button"
              class="deleteBtn" 
              data-id="${op.opinionId}" 
              data-slug="${op.movieSlug}"
            >
              🗑️
            </button>
          </div>
        `;

        contenedor.appendChild(div);
      });

      // borrar opinión
      const deleteButtons = document.querySelectorAll(".deleteBtn");
      deleteButtons.forEach(btn => {
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          const opinionId = btn.dataset.id;
          const slug = btn.dataset.slug;

          if (!confirm("¿seguro que querés borrar esta opinión?")) return;

          fetch(`${API_BASE}/movies/${slug}/opiniones/${opinionId}`, {
            method: "DELETE"
          })
            .then(res => {
              if (!res.ok) throw new Error("error al borrar opinión");
              btn.closest(".opinion").remove();
            })
            .catch(err => {
              console.error(err);
              alert("error al borrar la opinión");
            });
        });
      });

      // editar opinión (popup)
      const editButtons = document.querySelectorAll(".editBtn");
      editButtons.forEach(btn => {
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          opinionIdActual = btn.dataset.id;
          slugActual = btn.dataset.slug;
          botonEditActual = btn;

          const oldComment = btn.dataset.comment;
          const oldRating = Number(btn.dataset.rating);
          const movieTitle = btn.dataset["movieTitle"];

          if (tituloPeliculaSpan) {
            tituloPeliculaSpan.textContent = movieTitle || "";
          }

          if (textareaEditar) {
            textareaEditar.value = oldComment || "";
          }

          selectedRatingEditar = oldRating || 0;
          actualizarEstrellasEditar();

          if (popupEditar) {
            popupEditar.style.display = "flex";
          }
        });
      });

      // cerrar popup haciendo clic fuera
      if (popupEditar) {
        popupEditar.addEventListener("click", (e) => {
          if (e.target === popupEditar) {
            cerrarPopupEditar();
          }
        });
      }

      // selección de estrellas en popup editar
      for (let i = 0; i < starsEditar.length; i++) {
        starsEditar[i].addEventListener("click", () => {
          selectedRatingEditar = i + 1;
          actualizarEstrellasEditar();
        });
      }

      function actualizarEstrellasEditar() {
        for (let j = 0; j < starsEditar.length; j++) {
          if (j < selectedRatingEditar) {
            starsEditar[j].classList.add("active");
          } else {
            starsEditar[j].classList.remove("active");
          }
        }
      }

      function cerrarPopupEditar() {
        if (popupEditar) {
          popupEditar.style.display = "none";
        }
        opinionIdActual = null;
        slugActual = null;
        botonEditActual = null;
        selectedRatingEditar = 0;
        if (textareaEditar) textareaEditar.value = "";
        actualizarEstrellasEditar();
      }

      // guardar cambios (put)
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
                if (opinionDiv) {
                  const pComment = opinionDiv.querySelector(".comment");
                  const spanRatingValue = opinionDiv.querySelector(".ratingValue");

                  if (pComment) pComment.textContent = nuevoComentario;
                  if (spanRatingValue) spanRatingValue.textContent = selectedRatingEditar;
                }

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
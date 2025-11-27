// opiniones.js

const API_BASE = "https://obligatorio-2-jpi9.onrender.com"; // si usás Render, cambiá esto luego

document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  const usernameSpan = document.getElementById("username");
  if (usernameSpan) {
    usernameSpan.textContent = username || "Usuario";
  }

  // Logout
  const iconLogout = document.getElementById("iconLogout");
  if (iconLogout) {
    iconLogout.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  const contenedor = document.getElementById("opinionesList");

  if (!contenedor) {
    console.error("No se encontró el contenedor de opiniones (#opinionesList)");
    return;
  }

  if (!userId) {
    contenedor.innerHTML = "<p style='color:white;'>No estás logueado.</p>";
    return;
  }

  // ================== TRAER OPINIONES DEL USUARIO ==================
  fetch(`${API_BASE}/users/${userId}/opiniones`)
    .then(res => res.json())
    .then(data => {
      const opiniones = data.opiniones;

      if (!Array.isArray(opiniones) || opiniones.length === 0) {
        contenedor.innerHTML = "<p style='color:white;'>Todavía no escribiste opiniones.</p>";
        return;
      }

      // Pintar cada opinión
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
            >
              ✏️
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

      // ================== BORRAR OPINIÓN ==================
      const deleteButtons = document.querySelectorAll(".deleteBtn");
      deleteButtons.forEach(btn => {
        btn.addEventListener("click", (event) => {
          event.preventDefault();  // por si está dentro de un <a>
          event.stopPropagation();

          const opinionId = btn.dataset.id;
          const slug = btn.dataset.slug;

          if (!confirm("¿Seguro que querés borrar esta opinión?")) return;

          fetch(`${API_BASE}/movies/${slug}/opiniones/${opinionId}`, {
            method: "DELETE"
          })
            .then(res => {
              if (!res.ok) throw new Error("Error al borrar opinión");
              btn.closest(".opinion").remove();
            })
            .catch(err => {
              console.error(err);
              alert("Error al borrar la opinión");
            });
        });
      });

      // ================== EDITAR OPINIÓN (RATING + COMENTARIO) ==================
      const editButtons = document.querySelectorAll(".editBtn");
      editButtons.forEach(btn => {
        btn.addEventListener("click", (event) => {
          event.stopPropagation();

          const opinionId = btn.dataset.id;
          const slug = btn.dataset.slug;
          const oldComment = btn.dataset.comment;
          const oldRating = Number(btn.dataset.rating);

          // 1) Pedir nuevo rating
          let nuevoRatingStr = prompt("Editar rating (1 a 5):", oldRating);
          if (nuevoRatingStr === null) return; // canceló

          nuevoRatingStr = nuevoRatingStr.trim();
          const nuevoRating = Number(nuevoRatingStr);

          if (isNaN(nuevoRating) || nuevoRating < 1 || nuevoRating > 5) {
            alert("El rating debe ser un número entre 1 y 5.");
            return;
          }

          // 2) Pedir nuevo comentario
          const nuevoComentario = prompt("Editar tu opinión:", oldComment);
          if (nuevoComentario === null) return; // canceló

          if (nuevoComentario.trim().length < 5) {
            alert("El comentario debe tener al menos 5 caracteres.");
            return;
          }

          // 3) Enviar PUT al backend
          fetch(`${API_BASE}/movies/${slug}/opiniones/${opinionId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              rating: nuevoRating,
              comment: nuevoComentario
            })
          })
            .then(res => {
              if (!res.ok) throw new Error("Error al editar opinión");
              return res.text();
            })
            .then(msg => {
              console.log("Opinión editada:", msg);

              // 4) Actualizar HTML sin recargar
              const opinionDiv = btn.closest(".opinion");
              const pComment = opinionDiv.querySelector(".comment");
              const spanRatingValue = opinionDiv.querySelector(".ratingValue");

              pComment.textContent = nuevoComentario;
              spanRatingValue.textContent = nuevoRating;

              // Actualizar data-* para futuras ediciones
              btn.dataset.comment = nuevoComentario;
              btn.dataset.rating = nuevoRating;
            })
            .catch(err => {
              console.error(err);
              alert("Error al editar la opinión");
            });
        });
      });
    })
    .catch(err => {
      console.error("Error cargando opiniones:", err);
      contenedor.innerHTML = "<p style='color:white;'>Error al cargar tus opiniones.</p>";
    });
});
const username = localStorage.getItem("username");
const userId = localStorage.getItem("userId");
const API_BASE = "https://obligatorio-2-jpi9.onrender.com"; // ⚠️ cambiar a Render al subir

// Mostrar el username arriba
document.getElementById("username").textContent = username;

// Botón de logout
document.getElementById("iconLogout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

const contenedor = document.getElementById("opinionesList");

// Si no hay user logueado
if (!userId) {
  contenedor.innerHTML = "<p style='color:white;'>No estás logueado.</p>";
} else {
  // Traer todas las opiniones del usuario
  fetch(`${API_BASE}/users/${userId}/opiniones`)
    .then(res => res.json())
    .then(data => {
      const opiniones = data.opiniones;

      if (!Array.isArray(opiniones) || opiniones.length === 0) {
        contenedor.innerHTML = "<p style='color:white;'>Todavía no escribiste opiniones.</p>";
        return;
      }

      opiniones.forEach(op => {
        const div = document.createElement("div");
        div.className = "opinion";

        div.innerHTML = `
          <div class="opinionInfo">
            <h3 class="movieTitle">${op.movieTitle}</h3>
            <p class="comment">${op.comment}</p>
            <span class="rating">★ ${op.rating}/5</span>
          </div>
          <div class="opinionActions">
            <button class="editBtn" data-slug="${op.movieSlug}" data-id="${op.opinionId}">✏️</button>
            <button class="deleteBtn" data-slug="${op.movieSlug}" data-id="${op.opinionId}">🗑️</button>
          </div>
        `;

        contenedor.appendChild(div);
      });

      // --- BORRAR OPINIÓN ---
      document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", () => {
          const opinionId = btn.dataset.id;
          const slug = btn.dataset.slug;

          if (confirm("¿Seguro que querés borrar esta opinión?")) {
            fetch(`${API_BASE}/movies/${slug}/opiniones/${opinionId}`, {
              method: "DELETE"
            })
              .then(res => {
                if (!res.ok) throw new Error("Error al borrar la opinión");
                alert("Opinión eliminada con éxito");
                btn.closest(".opinion").remove();
              })
              .catch(err => {
                console.error(err);
                alert("Error al borrar la opinión");
              });
          }
        });
      });

      // --- EDITAR OPINIÓN (redirección al detalle por ahora) ---
      document.querySelectorAll(".editBtn").forEach(btn => {
        btn.addEventListener("click", () => {
          const slug = btn.dataset.slug;
          window.location.href = `detalle.html?slug=${slug}`;
        });
      });
    })
    .catch(err => {
      console.error("Error cargando opiniones:", err);
      contenedor.innerHTML = "<p style='color:white;'>Error al cargar tus opiniones.</p>";
    });
}